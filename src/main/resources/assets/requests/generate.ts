import type {
    ErrorResponse,
    Message,
    ModelRequestGenerateData,
    ModelResponseGenerateData,
} from '../../shared/types/model';
import {$config} from '../stores/config';

export async function generate(
    messages: Message[],
    instructions?: string,
): Promise<ModelResponseGenerateData | ErrorResponse> {
    const body = JSON.stringify({
        operation: 'generate',
        instructions,
        messages,
    } satisfies ModelRequestGenerateData);
    const response = await fetch($config.get().restServiceUrl, {method: 'POST', body});

    return (await response.json()) as ModelResponseGenerateData | ErrorResponse;
}
