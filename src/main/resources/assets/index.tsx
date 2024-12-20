import React from 'react';
import {createRoot} from 'react-dom/client';

import App from './components/App/App';
import './i18n/i18n';
import './index.css';
import {requestTranslation} from './requests/translation';
import {$config, setRestServiceUrl, setWsServiceUrl} from './stores/config';
import {getContentId, getLanguage, getProject} from './stores/data';
import {TranslationParams} from './stores/data/RequestData';

type SetupConfig = {
    restServiceUrl: string;
    wsServiceUrl: string;
};

export function render(container: HTMLElement): void {
    if ($config.get().restServiceUrl === '' || $config.get().wsServiceUrl === '') {
        console.warn('[Enonic AI] Translator dialog was rendered before configured.');
    }

    container.classList.add('ai-translator');

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

export function translate(instructions?: string, language?: string): Promise<void> {
    if ($config.get().restServiceUrl === '' || $config.get().wsServiceUrl === '') {
        console.warn('[Enonic AI] Translator was used before configured.');
    }

    const params: TranslationParams = {
        contentId: getContentId(),
        language: language ?? getLanguage().tag,
        project: getProject(),
        instructions,
    };

    return requestTranslation(params);
}
