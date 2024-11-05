import {Message} from '../../shared/types/model';
import {TRANSLATION_POOL_SIZE} from '../config';
import {DataEntry} from '../content/data';
import {logError} from '../logger';
import {ModelProxy} from '../proxy/model';
import {connect} from '../proxy/proxy';
import {TaskQueue} from './queue';

export type TranslateContentParams = {
    contentId: string;
    language: string;
    context: string;
    path: string;
    entry: DataEntry;
    instructions?: string | undefined;
};

export function translateContentField(item: TranslateContentParams): void {
    const description = `Translating content '${item.contentId}' in repo '${item.context}', field: ${item.path}`;
    TaskQueue.getTaskQueue(`${item.contentId}-${item.context}`, TRANSLATION_POOL_SIZE).addTask({
        func: () => translate(item),
        description,
        onError: () => log.error('Error: ' + description),
    });
}

function connectModel(messages: Message[], instructions?: string): Try<ModelProxy> {
    return connect({instructions, messages});
}

function createMessage(entry: DataEntry, language: string): Message[] {
    const text = String(entry.value);
    const prompt = [
        `Detect the language of the provided text and translate it into \`${language}\`.`,
        `* The format of the text is \`${entry.type}\`, so preserve ALL formatting (e.g., HTML tags, Markdown elements, etc.).`,
        `* The text is used in the context of "${entry.schemaLabel}". Only use this context if it is MEANINGFUL. If it is unclear or irrelevant, ignore it.`,
        'The text to translate:',
        text,
    ].join('\n');

    return [{role: 'user', text: prompt}];
}

function translate(item: TranslateContentParams): void {
    const [model, err1] = connectModel(createMessage(item.entry, item.language), item.instructions);

    if (err1) {
        logError(err1);
        return;
    }

    log.info(`Translating '${item.entry.value}' to '${item.language}'`);

    const [response, err2] = model.generate();

    if (err2) {
        logError(err2);
        return;
    }

    // send the response to Websocket
    log.info(`Translation result: '${item.entry.value}' -> '${response?.content}'`);
}
