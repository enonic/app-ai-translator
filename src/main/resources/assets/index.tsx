import React from 'react';
import {createRoot} from 'react-dom/client';

import App from './components/App/App';
import './i18n/config';
import './index.css';
import {$config, setRestServiceUrl, setWsServiceUrl} from './stores/config';
import {getLanguage} from './stores/data';
import {postTranslate} from './stores/requests';

type SetupConfig = {
    restServiceUrl: string;
    wsServiceUrl: string;
};

export function render(container: HTMLElement): void {
    if ($config.get().restServiceUrl === '' || $config.get().wsServiceUrl === '') {
        console.warn('[Enonic AI] Translator dialog was rendered before configured.');
    }

    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}

export function setup({restServiceUrl, wsServiceUrl}: SetupConfig): void {
    setRestServiceUrl(restServiceUrl);
    setWsServiceUrl(wsServiceUrl);
}

export async function translate(instructions?: string, language?: string): Promise<boolean> {
    if ($config.get().restServiceUrl === '' || $config.get().wsServiceUrl === '') {
        console.warn('[Enonic AI] Translator was used before configured.');
    }

    const translateTo = language ?? getLanguage().tag;
    return postTranslate(translateTo, instructions);
}
