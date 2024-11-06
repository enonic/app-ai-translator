import {ERRORS} from '../../shared/errors';
import {createTranslationPrompt} from '../../shared/prompts';
import {Message} from '../../shared/types/model';
import {DataEntry} from '../content/data';
import {ModelProxy} from '../proxy/model';
import {connect} from '../proxy/proxy';
import {addTask} from './queue';

export type TranslateContentParams = {
    language: string;
    entry: DataEntry;
    instructions?: string | undefined;
};

type TranslationData = {
    contentId: string;
    project: string;
    targetLanguage: string;
    customInstructions?: string;
};

type TranslationConfig = TranslationData & {
    fields: Record<string, DataEntry>;
};

type Callback = (path: string, result: Try<string>) => void;

export function translateFields(config: TranslationConfig, callback: Callback): void {
    const {fields, contentId, project, targetLanguage, customInstructions} = config;
    for (const path in fields) {
        const params: TranslateContentParams = {
            entry: fields[path],
            language: targetLanguage,
            instructions: customInstructions,
        };
        addTask({
            description: `Translating content '${contentId}' in repo '${project}', field: ${path}`,
            func: () => callback(path, translate(params)),
            onError: () => callback(path, [null, ERRORS.UNKNOWN_ERROR.withMsg('Translation task execution failed')]),
        });
    }
}

export function translate(item: TranslateContentParams): Try<string> {
    const [model, err] = connectModel(createMessage(item.entry, item.language), item.instructions);

    if (err) {
        return [null, err];
    }

    const [response, error] = model.generate();

    if (error) {
        return [null, error];
    }

    return [response.content, null];
}

function connectModel(messages: Message[], instructions?: string): Try<ModelProxy> {
    return connect({instructions, messages});
}

function createMessage(entry: DataEntry, language: string): Message[] {
    const text = String(entry.value);
    const prompt = createTranslationPrompt({
        text,
        language,
        type: entry.type,
        context: entry.schemaLabel,
    });

    return [{role: 'user', text: prompt}];
}
