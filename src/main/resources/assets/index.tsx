import React from 'react';
import {createRoot} from 'react-dom/client';

import {dispatchCompleted, dispatchStarted} from './common/events';
import App from './components/App/App';
import {requestTranslation} from './requests/translation';
import {$config, setServiceUrl} from './stores/config';
import {generateAllPathsEntries, getLanguage} from './stores/data';

type SetupConfig = {
    serviceUrl: string;
};

export function render(container: HTMLElement): void {
    if ($config.get().serviceUrl === '') {
        console.warn('[Enonic AI] Translator dialog was rendered before configured.');
    }

    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}

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
