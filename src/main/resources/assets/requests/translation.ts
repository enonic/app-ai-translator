import {TranslationParams} from '../stores/data/RequestData';
import {generate} from './generate';

export async function requestTranslation(params: TranslationParams): Promise<void> {
    try {
        await generate(params);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Error posting translation request for content:', params.contentId, msg);
    }
}
