import {ERRORS} from '../../lib/shared/errors';
import {Message} from '../../types/shared/model';
import {isErrorResponse} from '../common/data';
import {DataEntry} from '../stores/data';
import {generate} from './generate';

export async function requestTranslation({type, value, schemaLabel}: DataEntry, language: string): Promise<string> {
    const instructions = [
        `Detect the language of the provided text and translate it into \`${language}\`.`,
        `* The format of the text is \`${type}\`, so preserve ALL formatting (e.g., HTML tags, Markdown elements, etc.).`,
        `* The text is used in the context of "${schemaLabel}". Only use this context if it is MEANINGFUL. If it is unclear or irrelevant, ignore it.`,
        'The text to translate:',
    ].join('\n');
    const text = String(value);

    return await postTranslation(instructions, text);
}

async function postTranslation(instructions: string, text: string): Promise<string> {
    try {
        const messages: Message[] = [
            {role: 'user', text: instructions},
            {role: 'user', text},
        ];
        return (await postMessages(messages)) ?? text;
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Error translating text:', msg);
    }
    return text;
}

async function postMessages(messages: Message[]): Promise<Optional<string>> {
    const oldContents = getContents(messages);

    const response = await generate(messages);

    if (isErrorResponse(response)) {
        const isContinuation = messages.at(-1)?.role === 'model';
        if (isContinuation && ERRORS.MODEL_INVALID_ARGUMENT.is(response.error)) {
            // If previous generation was the last one (potential STOP), but hit MAX_TOKENS at the same time, it will
            // return MAX_TOKENS. So we'll try to generate more text, but this will lead to error, but that's expected.
        } else {
            console.error(response.error.message);
        }
        return oldContents;
    }

    const {content, finishReason} = response;

    if (finishReason == null || finishReason === 'STOP') {
        return oldContents ? oldContents + content : content;
    }

    if (finishReason === 'MAX_TOKENS' && content?.length > 0) {
        return postMessages([...messages, {role: 'model', text: content}]);
    }

    console.warn(`Generation request finished with reason "${finishReason}"`);

    if (content == null || content.length === 0) {
        return oldContents;
    }

    return (oldContents ?? '') + content;
}

function getContents(messages: Message[]): Optional<string> {
    const modelMessages = messages.filter(message => message.role === 'model');
    return modelMessages.length > 0 ? modelMessages.reduce((contents, {text}) => contents + text, '') : null;
}
