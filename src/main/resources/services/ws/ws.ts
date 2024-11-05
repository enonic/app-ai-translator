import * as websocketLib from '/lib/xp/websocket';

import {logError} from '../../lib/logger';
import {respondError} from '../../lib/requests';
import {unsafeUUIDv4} from '../../lib/utils/uuid';
import {WS_PROTOCOL} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {ClientMessage, MessageMetadata, MessageType, ServerMessage} from '../../shared/types/websocket';

export function get(request: Enonic.Request): Enonic.Response {
    if (!request.webSocket) {
        const error = ERRORS.REST_NOT_FOUND.withMsg('Trying to access WebSocket with "webSocket" set to "false"');
        return respondError(error, 404);
    }

    const protocols = request.headers?.['Sec-WebSocket-Protocol']?.split(', ');
    const isValidProtocol = protocols?.some(protocol => protocol === WS_PROTOCOL);
    if (!isValidProtocol) {
        const error = ERRORS.WS_INVALID_PROTOCOL.withMsg('Invalid WebSocket protocol');
        return respondError(error, 400);
    }

    return {
        status: 101,
        webSocket: {
            subProtocols: [WS_PROTOCOL],
        },
    };
}

export function webSocketEvent(event: Enonic.WebSocketEvent): void {
    try {
        const {type} = event;

        switch (type) {
            case 'open':
                log.info(JSON.stringify(event, null, 2));
                break;
            case 'message':
                handleMessage(event);
                break;
            case 'close':
                log.info(JSON.stringify(event, null, 2));
                break;
            case 'error':
                log.info(JSON.stringify(event, null, 2));
                break;
        }
    } catch (e) {
        logError(e);
    }
}

function handleMessage(event: Enonic.WebSocketEvent): void {
    const {id} = event.session;
    const message = parseMessage(event.message);
    if (!message) {
        return;
    }

    switch (message.type) {
        case MessageType.PING:
            sendMessage(id, {type: MessageType.PONG});
            break;
        case MessageType.CONNECT:
            sendMessage(id, {type: MessageType.CONNECTED});
            break;
    }
}

function parseMessage(message: Optional<string>): Optional<ClientMessage> {
    try {
        return message != null ? (JSON.parse(message) as ClientMessage) : undefined;
    } catch (e) {
        return undefined;
    }
}

function createMetadata(): MessageMetadata {
    return {
        id: unsafeUUIDv4(),
        timestamp: Date.now(),
    };
}

function sendMessage(id: string, message: Omit<ServerMessage, 'metadata'>): void {
    websocketLib.send(id, JSON.stringify({...message, metadata: createMetadata()}));
}
