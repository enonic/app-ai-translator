import React from 'react';
import {createRoot} from 'react-dom/client';

import App from './components/App/App';
import './i18n/config';
import './index.css';
import {$config, setServiceUrl} from './stores/config';
import {getLanguage} from './stores/data';
import {postTranslate} from './stores/requests';

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

export async function translate(instructions?: string, language?: string): Promise<boolean> {
    if ($config.get().serviceUrl === '') {
        console.warn('[Enonic AI] Translator was used before configured.');
    }

    const translateTo = language ?? getLanguage().tag;
    return postTranslate(translateTo, instructions);
}
