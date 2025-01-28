namespace Enonic {
    interface WebSocketEvent<Data extends AnyObject = AnyObject> {
        type: 'open' | 'close' | 'message' | 'error';
        session: WebSocketSession;
        data: Data;
        message?: string;
        error?: string;
    }

    interface WebSocketSession {
        id: string;
        user?: {
            key: `user:${string}:${string}`;
            displayName: string;
            disabled?: boolean;
            email?: string;
            login: string;
            idProvider: string;
        };
    }
}
