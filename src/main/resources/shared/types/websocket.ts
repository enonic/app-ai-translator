export type MessageMetadata = {
    id: string;
    timestamp: number;
};

type BaseMessage<T extends MessageType> = {
    type: T;
    metadata: MessageMetadata;
};

type MessageWithPayload<T extends MessageType, P = unknown> = BaseMessage<T> & {
    payload: P;
};

export enum MessageType {
    // Connection lifecycle (client → server)
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',

    // Connection lifecycle (server → client)
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',

    // Connection health
    PING = 'ping',
    PONG = 'pong',

    // Translation flow (client → server)
    TRANSLATE = 'translate',

    // Translation flow (server → client)
    ACCEPTED = 'accepted',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

// Client requests translation
export type TranslateMessage = MessageWithPayload<
    MessageType.TRANSLATE,
    {
        contentId: string;
        project: string;
        targetLanguage: string;
        customInstructions?: string;
    }
>;

// Server accepts translation request
export type AcceptedMessage = MessageWithPayload<
    MessageType.ACCEPTED,
    {
        contentId: string;
        paths: string[];
    }
>;

// Server completed translation for a field
export type CompletedMessage = MessageWithPayload<
    MessageType.COMPLETED,
    {
        contentId: string;
        path: string;
        text: string;
    }
>;

// Server reports translation failure
export type FailedMessage = MessageWithPayload<
    MessageType.FAILED,
    {
        contentId: string;
        path?: string;
        code: string;
        message: string;
        details?: unknown;
    }
>;

// Connection messages
export type ConnectMessage = BaseMessage<MessageType.CONNECT>;
export type ConnectedMessage = BaseMessage<MessageType.CONNECTED>;
export type DisconnectMessage = BaseMessage<MessageType.DISCONNECT>;
export type DisconnectedMessage = BaseMessage<MessageType.DISCONNECTED>;

// Health check messages
export type PingMessage = BaseMessage<MessageType.PING>;
export type PongMessage = BaseMessage<MessageType.PONG>;

export type ClientMessage = ConnectMessage | DisconnectMessage | PingMessage | TranslateMessage;

export type ServerMessage =
    | ConnectedMessage
    | DisconnectedMessage
    | PongMessage
    | AcceptedMessage
    | CompletedMessage
    | FailedMessage;
