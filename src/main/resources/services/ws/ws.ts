import * as taskLib from '/lib/xp/task';
import * as websocketLib from '/lib/xp/websocket';
import cron from '/lib/cron';

import {getTranslatableDataFromContent} from '../../lib/content/content';
import {DataEntry} from '../../lib/content/data';
import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {respondError} from '../../lib/requests';
import {translateFields} from '../../lib/translate/translate';
import {unsafeUUIDv4} from '../../lib/utils/uuid';
import {WS_PROTOCOL} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {
    AcceptedMessage,
    ClientMessage,
    CompletedMessage,
    FailedMessage,
    MessageMetadata,
    MessageType,
    ServerMessage,
    TranslateMessage,
} from '../../shared/types/websocket';

const POLL_MESSAGES_TASK = 'send-ws-messages';

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
                break;
            case 'message':
                handleMessage(event);
                break;
            case 'close':
                handleClose();
                break;
            case 'error':
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

    logDebug(LogDebugGroups.WS, `Received message: ${JSON.stringify(message)}`);

    switch (message.type) {
        case MessageType.PING:
            sendMessage(id, {type: MessageType.PONG});
            break;
        case MessageType.CONNECT:
            sendMessage(id, {type: MessageType.CONNECTED});
            break;
        case MessageType.TRANSLATE:
            startTranslation(id, message);
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

function startTranslation(sessionId: string, message: TranslateMessage): void {
    const data = message.payload;
    const itemsToTranslate = getTranslatableDataFromContent(data.contentId, data.project);

    sendMessage(sessionId, makeAcceptedMessage(data.contentId, itemsToTranslate));

    const wsMessagesQueue = new Map<string, Try<string>>();

    // sending messages to the client in a separate task/thread to make sending synchronous to avoid ws backend error, see XP-10759
    taskLib.executeFunction({
        description: 'ai-translator-task-ws',
        func: () => {
            pollAndSendMessages(sessionId, data.contentId, wsMessagesQueue);
        },
    });

    translateFields(
        {
            fields: itemsToTranslate,
            contentId: data.contentId,
            project: data.project,
            targetLanguage: data.targetLanguage,
            customInstructions: data.customInstructions,
        },
        (path, result) => {
            wsMessagesQueue.set(path, result);
        },
    );
}

function makeAcceptedMessage(
    contentId: string,
    itemsToTranslate: Record<string, DataEntry>,
): Omit<AcceptedMessage, 'metadata'> {
    return {
        type: MessageType.ACCEPTED,
        payload: {
            contentId,
            paths: Object.keys(itemsToTranslate),
        },
    };
}

function makeCompletedMessage(contentId: string, path: string, text: string): Omit<CompletedMessage, 'metadata'> {
    return {
        type: MessageType.COMPLETED,
        payload: {
            contentId,
            text,
            path: path,
        },
    };
}

function makeFailedMessage(err: AiError, contentId: string, path: string): Omit<FailedMessage, 'metadata'> {
    return {
        type: MessageType.FAILED,
        payload: {
            contentId,
            path: path,
            message: err.message,
            code: err.code?.toString(),
        },
    };
}

function pollAndSendMessages(sessionId: string, contentId: string, messages: Map<string, Try<string>>): void {
    cron.schedule({
        name: POLL_MESSAGES_TASK,
        fixedDelay: 500,
        delay: 1000,
        times: 240, // 500ms * 240 = 120s, run for 2 minutes
        callback: () => {
            messages.forEach((result, path) => {
                const [text, err] = result;

                if (err) {
                    sendMessage(sessionId, makeFailedMessage(err, contentId, path));
                } else {
                    sendMessage(sessionId, makeCompletedMessage(contentId, path, text));
                }

                messages.delete(path);
            });
        },
    });
}

function handleClose(): void {
    cron.unschedule({name: POLL_MESSAGES_TASK});
}
