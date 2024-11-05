import {computed, map} from 'nanostores';

import {WS_PROTOCOL} from '../../shared/constants';
import {ClientMessage, MessageMetadata, MessageType, ServerMessage} from '../../shared/types/websocket';
import {dispatchCompleted, dispatchStarted} from '../common/events';
import {$config} from './config';
import {$data, getLanguage} from './data';
import {$instructions} from './dialog';

type WebSocketStore = {
    state: 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
    connection: Optional<WebSocket>;
    paths: string[];
};

export const $websocket = map<WebSocketStore>({
    state: 'disconnected',
    connection: null,
    paths: [],
});

export const $translating = computed($websocket, ({connection}) => connection != null);

export function startTranslation(): void {
    const contentId = $data.get().persisted?.contentId;

    if ($translating.get() || !contentId) {
        return;
    }

    const targetLanguage = getLanguage().tag;
    const customInstructions = $instructions.get();

    connect();

    const unsubscribe = $websocket.subscribe(({state}) => {
        if (state === 'connected') {
            requestTranslation(contentId, targetLanguage, customInstructions);
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
                removePath(path);
                dispatchCompleted({path});
            } else {
                // Global error
                const {paths} = $websocket.get();
                paths.forEach(path => dispatchCompleted({path}));
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

function requestTranslation(contentId: string, targetLanguage: string, customInstructions?: string): void {
    sendMessage({
        type: MessageType.TRANSLATE,
        metadata: createMetadata(),
        payload: {
            contentId,
            targetLanguage,
            customInstructions,
        },
    });
}
