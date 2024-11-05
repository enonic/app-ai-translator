import {$config} from '../stores/config';
import {TranslationParams} from '../stores/data/RequestData';

export async function generate(params: TranslationParams): Promise<void> {
    const body = JSON.stringify({
        operation: 'generate',
        ...params,
    });

    return fetch($config.get().restServiceUrl, {method: 'POST', body}).then(() => Promise.resolve());
}
