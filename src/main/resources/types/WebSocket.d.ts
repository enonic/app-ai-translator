namespace Enonic {
    interface WebSocketEvent<Data extends AnyObject = AnyObject> {
        type: 'open' | 'close' | 'message' | 'error';
        session: {
            id: string;
        };
        data: Data;
        error: string;
    }
}
