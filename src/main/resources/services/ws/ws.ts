import * as webSocketLib from '/lib/xp/websocket';

import {logError} from '../../lib/logger';
import {respondError} from '../../lib/requests';
import {ERRORS} from '../../shared/errors';

export function get(request: Enonic.Request): Enonic.Response {
    if (!request.webSocket) {
        const error = ERRORS.REST_NOT_FOUND.withMsg('Trying to access WebSocket with "webSocket" set to "false"');
        return respondError(error, 404);
    }

    return {
        status: 200,
        contentType: 'text/plain',
        body: 'WebSocket endpoint',
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
                log.info(JSON.stringify(event, null, 2));
                webSocketLib;
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
