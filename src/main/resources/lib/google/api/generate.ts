import type {GenerateContentRequest, GenerateContentResponse} from '@google/generative-ai';

import {logDebug, LogDebugGroups} from '../../logger';
import {parseResponse, sendPostRequest} from '../client';

export function generate(params: GenerateContentRequest): Try<GenerateContentResponse> {
    logDebug(LogDebugGroups.GOOGLE, `generate.generate(${JSON.stringify(params)})`);

    const [response, err] = sendPostRequest(params);
    if (err) {
        return [null, err];
    }

    return parseResponse(response);
}
