import type {
    ErrorResponse,
    Message,
    ModelRequestGenerateData,
    ModelResponseGenerateData,
} from '../../types/shared/model';
import {isErrorResponse} from '../common/data';
import {$config} from '../stores/config';

export async function generate(messages: Message[]): Promise<ModelResponseGenerateData | ErrorResponse> {
    const result = await requestGenerate(messages);

    if (isErrorResponse(result)) {
        throw new Error(result.error.message);
    }

    return result;
}

async function requestGenerate(messages: Message[]): Promise<ModelResponseGenerateData | ErrorResponse> {
    const body = JSON.stringify({
        operation: 'generate',
        messages,
    } satisfies ModelRequestGenerateData);
    const response = await fetch($config.get().serviceUrl, {method: 'POST', body});

    return (await response.json()) as ModelResponseGenerateData | ErrorResponse;
}
