import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type {
  AiPlugin,
  AiPluginContext,
  AiPluginInstance,
} from '@shared/ai-protocol';
import { App } from '@/components/App/App';
import { fetchLicenseState } from '@/requests/license';
import { injectStyles } from '@/shadow/injectStyles';
import { ShadowHostContext } from '@/shadow/ShadowHostContext';
import { registerThemeHost } from '@/shadow/themeSync';
import {
  applyConfig,
  applyContent,
  applyLanguage,
  applySchema,
  clearPluginContext,
  openDialog,
  setPluginContext,
} from '@/store/host';

import './i18n/i18n';

const VERSION = '1.0.0';

async function mount(container: HTMLElement, context: AiPluginContext): Promise<AiPluginInstance> {
  setPluginContext(context);

  applyConfig(context.config);
  if (context.initial.content != null) applyContent(context.initial.content);
  if (context.initial.schema != null) applySchema(context.initial.schema);
  if (context.initial.language != null) applyLanguage(context.initial.language);

  const licenseState = await fetchLicenseState();
  if (licenseState !== 'OK') {
    const reason = typeof licenseState === 'string' ? licenseState : licenseState.message;
    throw new Error(`[ai.translator] license check failed: ${reason}`);
  }

  const shadow = container.shadowRoot ?? container.attachShadow({ mode: 'open' });
  injectStyles(shadow);
  registerThemeHost(container);

  const mountEl = document.createElement('div');
  shadow.appendChild(mountEl);
  const root: Root = createRoot(mountEl);

  const offSignals = [
    context.api.on('content:change', applyContent),
    context.api.on('schema:change', applySchema),
    context.api.on('language:change', applyLanguage),
    context.api.on('config:change', applyConfig),
    context.api.on('dialog:open', openDialog),
  ];

  root.render(
    <StrictMode>
      <ShadowHostContext.Provider value={mountEl}>
        <App />
      </ShadowHostContext.Provider>
    </StrictMode>,
  );

  return {
    dispose: () => {
      offSignals.forEach((off) => off());
      root.unmount();
      mountEl.remove();
      clearPluginContext();
    },
  };
}

const plugin: AiPlugin = {
  id: 'ai.translator',
  version: VERSION,
  commands: ['dialog:open'],
  mount,
};

window.Enonic?.AI?.register(plugin);
