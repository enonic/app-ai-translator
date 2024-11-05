import type {HttpClientResponse} from '/lib/http-client';

import {CustomAiError, ERRORS} from '../../shared/errors';
import {logDebug, LogDebugGroups, logError} from '../logger';
import {request, RequestParams} from '../requests';
import {getOptions} from './options';

type GoogleRequestOptions = Omit<RequestParams, 'url'> & {
    method: Enonic.HttpMethod;
};

type GoogleHeaders = {
    'content-type': 'application/json';
} & Enonic.RequestHeaders;

type GoogleErrorResponseBody = {
    error: Partial<GoogleErrorData>;
};

type GoogleErrorData = {
    code: number;
    message: string;
    status: string;
};

function sendRequest(params: GoogleRequestOptions): Try<HttpClientResponse> {
    logDebug(LogDebugGroups.GOOGLE, `client.sendRequest(${params?.method}})`);

    const [options, err] = getOptions();
    if (err) {
        return [null, err];
    }
    const {accessToken, url} = options;

    logDebug(LogDebugGroups.GOOGLE, `client.sendRequest(${params?.method}}) url: ${url}`);

    const headers: GoogleHeaders = {
        ...(params.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
    };
    return request({
        ...params,
        headers,
        url,
    });
}

export function sendPostRequest(body?: unknown): Try<HttpClientResponse> {
    return sendRequest({method: 'POST', body});
}

export function parseResponse<Data, Body = unknown>(
    response: HttpClientResponse,
    mapper?: (body: Body) => Data,
): Try<Data> {
    logDebug(LogDebugGroups.GOOGLE, 'client.parseResponse()');

    try {
        if (response.status >= 400) {
            const error = parseError(response);
            logDebug(LogDebugGroups.GOOGLE, `client.parseResponse() error: ${String(error)}`);
            return [null, error];
        }

        if (response.body == null) {
            return [null, ERRORS.RESPONSE_BODY_MISSING];
        }

        const data = JSON.parse(response.body) as unknown;
        return [mapper?.(data as Body) ?? (data as Data), null];
    } catch (e) {
        logError(e);
        return [null, ERRORS.GOOGLE_RESPONSE_PARSE_FAILED];
    }
}

function parseError({body, message}: HttpClientResponse): CustomAiError {
    logDebug(LogDebugGroups.GOOGLE, 'client.parseError()');

    if (body == null) {
        return message ? ERRORS.GOOGLE_REQUEST_FAILED.withMsg(message) : ERRORS.GOOGLE_REQUEST_FAILED;
    }

    try {
        const {error} = (JSON.parse(body) ?? {error: {}}) as GoogleErrorResponseBody;
        const {message: errorMessage = '', status} = error;
        if (status === 'INVALID_ARGUMENT') {
            return ERRORS.MODEL_INVALID_ARGUMENT.withMsg(errorMessage);
        }
        if (status === 'FAILED_PRECONDITION') {
            return ERRORS.MODEL_FAILED_PRECONDITION.withMsg(errorMessage);
        }
        return ERRORS.MODEL_UNKNOWN_ERROR.withMsg(errorMessage);
    } catch (e) {
        return ERRORS.MODEL_UNKNOWN_ERROR.withMsg('Cannot parse error message.');
    }
}
