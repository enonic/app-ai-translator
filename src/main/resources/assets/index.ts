import {dispatchCompleted, dispatchStarted} from './common/events';
import {postTranslation} from './requests/translation';
import {$config, setServiceUrl} from './stores/config';
import {DataEntry, generateAllPathsEntries, getLanguage} from './stores/data';

type SetupConfig = {
    serviceUrl: string;
};

export function setup({serviceUrl}: SetupConfig): void {
    setServiceUrl(serviceUrl);
}

export async function translate(language?: string): Promise<boolean> {
    if ($config.get().serviceUrl === '') {
        console.warn('[Enonic AI] Translator was rendered before configured.');
    }

    const translateTo = language ?? getLanguage();
    const entries = generateAllPathsEntries();
    const translations = Object.entries(entries).map(async ([path, entry]): Promise<void> => {
        if (entry.value) {
            dispatchStarted({path});
            const value = await requestTranslation(entry, translateTo);
            dispatchCompleted({path, value});
        }
    });

    await Promise.all(translations);

    return true;
}

export function isAvailable(): boolean {
    const entries = generateAllPathsEntries();
    return Object.values(entries).some(entry => !!entry.value);
}

async function requestTranslation({type, value, schemaLabel}: DataEntry, language: string): Promise<string> {
    const instructions = [
        `Detect the language of the provided text and translate it into \`${language}\`.`,
        `* The format of the text is \`${type}\`, so preserve ALL formatting (e.g., HTML tags, Markdown elements, etc.).`,
        `* The text is used in the context of "${schemaLabel}". Only use this context if it is MEANINGFUL. If it is unclear or irrelevant, ignore it.`,
        'The text to translate:',
    ].join('\n');
    const text = String(value);

    return await postTranslation(instructions, text);
}
