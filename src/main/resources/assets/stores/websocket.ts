import {computed, map} from 'nanostores';

import {WS_PROTOCOL} from '../../shared/constants';
import {ClientMessage, MessageMetadata, MessageType, ServerMessage} from '../../shared/types/websocket';
import {dispatchAllCompleted, dispatchCompleted, dispatchFailed, dispatchStarted} from '../common/events';
import {$config} from './config';
import {$data, getLanguage} from './data';
import {$instructions} from './dialog';

type WebSocketStore = {
    state: 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
    connection: Optional<WebSocket>;
    paths: string[];
    anyFailed: boolean;
};

export const $websocket = map<WebSocketStore>({
    state: 'disconnected',
    connection: null,
    paths: [],
    anyFailed: false,
});

export const $translating = computed($websocket, ({connection}) => connection != null);

export function startTranslation(): void {
    const contentId = $data.get().persisted?.contentId;
    const project = $data.get().persisted?.project;

    if ($translating.get() || !contentId || !project) {
        return;
    }

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
        paths: [],
        connection: null,
        anyFailed: false,
    });
}

//
//* Receive
//

function handleMessage(event: MessageEvent<string>): void {
    const message = JSON.parse(event.data) as ServerMessage;

    switch (message.type) {
        case MessageType.CONNECTED:
            $websocket.setKey('state', 'connected');
            break;

        case MessageType.ACCEPTED: {
            const {paths} = message.payload;
            $websocket.setKey('paths', paths);
            paths.forEach(path => {
                dispatchStarted({path});
            });
            break;
        }

        case MessageType.COMPLETED: {
            const {path, text} = message.payload;
            dispatchCompleted({path, text});
            removePath(path);
            break;
        }

        case MessageType.FAILED: {
            const {path} = message.payload;
            if (path) {
                $websocket.setKey('anyFailed', true);
                removePath(path);
                dispatchFailed({path, text: 'Translation failed'});
            } else {
                // Global error
                const {paths} = $websocket.get();
                paths.forEach(path => dispatchFailed({path}));
                dispatchAllCompleted({anyFailed: true});
                closeConnection();
            }
            break;
        }

        case MessageType.DISCONNECTED:
            cleanup();
            break;
    }
}

function removePath(path: string): void {
    const paths = $websocket.get().paths.filter(p => p !== path);
    $websocket.setKey('paths', paths);
    if (paths.length === 0) {
        dispatchAllCompleted({anyFailed: $websocket.get().anyFailed});
        closeConnection();
    }
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
