import {t} from 'i18next';
import {computed, map} from 'nanostores';

import {WS_PROTOCOL} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {ClientMessage, MessageMetadata, MessageType, ServerMessage} from '../../shared/types/websocket';
import {dispatchAllCompleted, dispatchCompleted, dispatchStarted} from '../common/events';
import {$config} from './config';
import {$data, getLanguage} from './data';
import {$dialog, $instructions, setDialogView} from './dialog';
import {
    $items,
    $itemsState,
    addFailed,
    addSucceeded,
    resetItems,
    setGlobalFailure,
    setPaths,
    skipRemaining,
} from './items';

type WebSocketStore = {
    state: 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
    connection: Optional<WebSocket>;
    success: boolean;
};

export const $websocket = map<WebSocketStore>({
    state: 'disconnected',
    connection: null,
    success: true,
});

export const $translating = computed($websocket, ({connection}) => connection != null);

export function startTranslation(): void {
    const contentId = $data.get().persisted?.contentId;
    const project = $data.get().persisted?.project;

    if ($translating.get() || !contentId || !project) {
        return;
    }

    resetItems();

    const targetLanguage = getLanguage().tag;
    const customInstructions = $instructions.get();

    connect();

    const unsubscribe = $websocket.subscribe(({state}) => {
        if (state === 'connected') {
            requestTranslation(contentId, project, targetLanguage, customInstructions);
            unsubscribe();
        }
    });
}

//
//* Connection
//

const PING_INTERVAL = 50000; // ms
let pingInterval: number;

function connect(): void {
    const {wsServiceUrl} = $config.get();
    const ws = new WebSocket(wsServiceUrl, [WS_PROTOCOL]);

    ws.onopen = () => {
        $websocket.setKey('connection', ws);
        $websocket.setKey('state', 'connecting');

        sendMessage({
            type: MessageType.CONNECT,
            metadata: createMetadata(),
        });

        pingInterval = window.setInterval(() => {
            sendMessage({
                type: MessageType.PING,
                metadata: createMetadata(),
            });
        }, PING_INTERVAL);
    };

    ws.onmessage = handleMessage;

    ws.onerror = closeConnection;

    ws.onclose = cleanup;
}

function closeConnection(): void {
    const {connection} = $websocket.get();
    if (connection?.readyState === WebSocket.OPEN) {
        $websocket.setKey('state', 'disconnecting');
        sendMessage({
            type: MessageType.DISCONNECT,
            metadata: createMetadata(),
        });
        connection.close();
    }
    cleanup();
}

function cleanup(): void {
    clearInterval(pingInterval);
    $websocket.set({
        state: 'disconnected',
        connection: null,
        success: true,
    });
}

//
//* Receive
//

function handleMessage(event: MessageEvent<string>): void {
    const msg = JSON.parse(event.data) as ServerMessage;

    switch (msg.type) {
        case MessageType.CONNECTED:
            $websocket.setKey('state', 'connected');
            break;

        case MessageType.ACCEPTED: {
            const {paths} = msg.payload;
            setPaths(paths);
            paths.forEach(path => {
                dispatchStarted({path});
            });
            break;
        }

        case MessageType.COMPLETED: {
            const {path, text} = msg.payload;
            addSucceeded(path);
            dispatchCompleted({path, text, success: true});
            break;
        }

        case MessageType.FAILED: {
            const {code, path} = msg.payload;
            const message = getErrorMessageByCode(Number(code));

            console.error(`AI <${code}> error: ${msg.payload.message}`);

            if (path) {
                addFailed(path, message);
                dispatchCompleted({path, message, success: false});
            } else {
                // Global error
                $websocket.setKey('success', false);
                setGlobalFailure(message);
                const {remaining} = $items.get();
                remaining.forEach(path => dispatchCompleted({path, message, success: false}));
                dispatchAllCompleted({message, success: false});
                closeConnection();
            }
            break;
        }

        case MessageType.DISCONNECTED:
            cleanup();
            break;
    }
}

export function stopTranslation(): void {
    const {remaining} = $items.get();

    remaining.forEach(path => dispatchCompleted({path, success: true}));
    skipRemaining();

    closeConnection();
}

//
//* Send
//

function createMetadata(): MessageMetadata {
    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    };
}

function sendMessage(message: ClientMessage): void {
    const {connection} = $websocket.get();
    if (connection?.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
    }
}

function requestTranslation(
    contentId: string,
    project: string,
    targetLanguage: string,
    customInstructions?: string,
): void {
    sendMessage({
        type: MessageType.TRANSLATE,
        metadata: createMetadata(),
        payload: {
            contentId,
            project,
            targetLanguage,
            customInstructions,
        },
    });
}

function getErrorMessageByCode(code: number): string {
    switch (code) {
        case ERRORS.GOOGLE_SAK_MISSING.code:
        case ERRORS.GOOGLE_SAK_READ_FAILED.code:
        case ERRORS.GOOGLE_ACCESS_TOKEN_MISSING.code:
        case ERRORS.GOOGLE_PROJECT_ID_MISSING.code:
            return t('text.error.configuration');
        case ERRORS.WS_INVALID_PROTOCOL.code:
            return t('text.error.websocket.protocol');
        case ERRORS.QUERY_CONTENT_NOT_FOUND.code:
        case ERRORS.QUERY_CONTENT_TYPE_NOT_FOUND.code:
            return t('text.error.query.notFound');
        case ERRORS.FUNC_INSUFFICIENT_DATA.code:
        case ERRORS.FUNC_UNKNOWN_MODE.code:
        case ERRORS.FUNC_NO_TRANSLATABLE_FIELDS.code:
            return t('text.error.function');
        case ERRORS.MODEL_UNKNOWN_ERROR.code:
        case ERRORS.MODEL_INVALID_ARGUMENT.code:
        case ERRORS.MODEL_FAILED_PRECONDITION.code:
            return t('text.error.model', {code});
        case ERRORS.GOOGLE_BLOCKED.code:
            return t('text.error.response.safety');
        case ERRORS.GOOGLE_REQUEST_FAILED.code:
            return t('text.error.google.request');
        case ERRORS.GOOGLE_RESPONSE_PARSE_FAILED.code:
            return t('text.error.google.parse');
        case ERRORS.GOOGLE_CANDIDATES_EMPTY.code:
            return t('text.error.google.empty');
        case ERRORS.LICENSE_ERROR_MISSING.code:
            return t('text.error.license.invalid');
        case ERRORS.LICENSE_ERROR_EXPIRED.code:
            return t('text.error.license.expired');
        default:
            return t('text.error.unknown', {code});
    }
}

//
//* Completion
//

let completeTimeoutId: number;

$itemsState.subscribe(state => {
    const {view} = $dialog.get();

    if ((state === 'completed' || state === 'failed') && view === 'processing') {
        clearTimeout(completeTimeoutId);

        if (state === 'completed') {
            completeTimeoutId = setTimeout(finalizeTranslation, 500);
        } else {
            finalizeTranslation();
        }
    }
});

function finalizeTranslation(): void {
    setDialogView('completed');

    const {success} = $websocket.get();
    dispatchAllCompleted({success});

    stopTranslation();
}
