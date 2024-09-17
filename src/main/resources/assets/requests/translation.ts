import {Message} from '../../types/shared/model';
import {isErrorResponse} from '../common/data';
import {generate} from './generate';

export async function postTranslation(text: string): Promise<Optional<string>> {
    try {
        const messages: Message[] = [{role: 'user', text}];
        const response = await generate(messages);

        if (isErrorResponse(response)) {
            throw new Error(response.error.message);
        }

        const {content, finishReason} = response;

        if (finishReason != null && finishReason !== 'STOP') {
            throw new Error(`Generation request finished with reason "${finishReason}"`);
        }

        return parseTranslation(content);
    } catch (error) {
        console.error('Error translating text:', error);
    }
}

function parseTranslation(content: string): string {
    try {
        const {translation} = JSON.parse(content) as {translation: string};
        if (typeof translation === 'string') {
            return translation;
        }
    } catch (error) {
        // ignore
    }

    return content;
}
