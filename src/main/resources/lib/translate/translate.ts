import {ERRORS} from '../../shared/errors';
import {createTranslationPrompt} from '../../shared/prompts';
import {Message} from '../../shared/types/model';
import type {TextType} from '../../shared/types/text';
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

export function translateFields(config: TranslationConfig, callback: Callback, sessionId: string): void {
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
        }, sessionId);
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

    const text = cleanContent(response.content, item.entry.type);

    if (text == null || (text === '' && item.entry.value !== '')) {
        return [null, ERRORS.FUNC_TRANSLATION_EMPTY];
    }

    return [text, null];
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

function cleanContent(content: Optional<string>, type: TextType): string | null {
    if (content == null) {
        return null;
    }

    return (type === 'html' ? cleanBackticks(content) : content).trim();
}

function cleanBackticks(input: string): string {
    return input.replace(/^```(?:\w+)?\s*|^`+|`+$|```$/g, '');
}
