import React from 'react';
import {createRoot} from 'react-dom/client';

import {dispatchNoLicense} from './common/events';
import App from './components/App/App';
import './i18n/i18n';
import './index.css';
import {fetchLicenseState} from './requests/license';
import {$config, setLicenseServiceUrl, setWsServiceUrl} from './stores/config';

type SetupConfig = {
    licenseServiceUrl: string;
    wsServiceUrl: string;
};

export async function render(container: HTMLElement): Promise<void> {
    if ($config.get().licenseServiceUrl === '' || $config.get().wsServiceUrl === '') {
        console.warn('[Enonic AI] Translator dialog was rendered before configured.');
    }

    const fetchLicenseStateResult = await fetchLicenseState();

    if (fetchLicenseStateResult !== 'OK') {
        dispatchNoLicense();
    } else {
        container.classList.add('ai-translator');

        const root = createRoot(container);

        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
        );
    }
}

export function setup({licenseServiceUrl, wsServiceUrl}: SetupConfig): void {
    setLicenseServiceUrl(licenseServiceUrl);
    setWsServiceUrl(wsServiceUrl);
}
