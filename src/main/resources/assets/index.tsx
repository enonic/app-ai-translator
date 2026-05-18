import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { dispatchNoLicense } from '@/common/events';
import { App } from '@/components/App/App';
import { fetchLicenseState } from '@/requests/license';
import { injectStyles } from '@/shadow/inject-styles';
import { ShadowHostContext } from '@/shadow/ShadowHostContext';
import { registerThemeHost } from '@/shadow/theme-sync';
import { $config, setLicenseServiceUrl, setWsServiceUrl } from '@/store/config';

import './i18n/i18n';

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
    return;
  }

  const shadow = container.shadowRoot ?? container.attachShadow({ mode: 'open' });
  injectStyles(shadow);
  registerThemeHost(container);

  const mount = document.createElement('div');
  shadow.appendChild(mount);

  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <ShadowHostContext.Provider value={mount}>
        <App />
      </ShadowHostContext.Provider>
    </StrictMode>,
  );
}

export function setup({ licenseServiceUrl, wsServiceUrl }: SetupConfig): void {
  setLicenseServiceUrl(licenseServiceUrl);
  setWsServiceUrl(wsServiceUrl);
}
