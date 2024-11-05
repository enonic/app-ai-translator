import * as authLib from '/lib/xp/auth';

import {getTranslatableDataFromContent} from '../../lib/content/content';
import {logDebug, LogDebugGroups, logError} from '../../lib/logger';
import {respond, respondError, RestPostResponse} from '../../lib/requests';
import {translateContentField} from '../../lib/translate/translate';
import {isRecordEmpty} from '../../lib/utils/func';
import {ERRORS} from '../../shared/errors';
import {ModelRequestData} from '../../shared/types/model';

export function post(request: Enonic.Request): Enonic.Response<RestPostResponse> {
    logDebug(LogDebugGroups.REST, 'post()');

    const isAuthenticated = authLib.getUser() != null;
    if (!isAuthenticated) {
        return respondError(ERRORS.REST_NOT_AUTHENTICATED, 401);
    }

    try {
        const [data, err1] = parsePostRequest(request);
        if (err1) {
            return respondError(err1);
        }

        const itemsToTranslate = getTranslatableDataFromContent(data.contentId, data.context);

        if (isRecordEmpty(itemsToTranslate)) {
            return respond(200, {message: 'No translatable fields found'});
        }

        for (const path in itemsToTranslate) {
            translateContentField({
                contentId: data.contentId,
                context: data.context,
                language: data.language,
                path,
                entry: itemsToTranslate[path],
                instructions: data.instructions,
            });
        }

        return respond(200, {message: 'Started fields translation for ' + data.contentId + ' in ' + data.context});
    } catch (err3) {
        logError(err3);
        return respondError(ERRORS.REST_UNHANDLED_ERROR.withMsg(String(err3)));
    }
}

function parsePostRequest(request: Enonic.Request): Try<ModelRequestData> {
    if (!request.body) {
        return [null, ERRORS.REST_REQUEST_BODY_MISSING];
    }

    const body = JSON.parse(request.body) as ModelRequestData;

    switch (body.operation) {
        case 'generate':
            if (body.contentId == null) {
                return [null, ERRORS.REST_CONTENT_ID_REQUIRED];
            }
            if (body.language == null) {
                return [null, ERRORS.REST_CONTENT_ID_REQUIRED];
            }
            if (body.context == null) {
                return [null, ERRORS.REST_CONTEXT_MISSING];
            }
            return [body, null];
        default:
            return [null, ERRORS.REST_OPERATION_NOT_SUPPORTED];
    }
}
