import type {
  AiContentSnapshot,
  AiLanguageSnapshot,
  AiPluginConfig,
  AiSchemaSnapshot,
} from '@shared/ai-protocol';

import { setConfig } from '@/store/config';
import { setLanguage, setPersistedData, setSchema } from '@/store/content';
import { $dialog, setDialogView, toggleDialog } from '@/store/dialog';

// Thin adapters: take a protocol snapshot/config and call the matching store
// setter. They receive the typed payload directly — no CustomEvent unwrapping.

export const applyConfig = (config: AiPluginConfig): void => setConfig(config);

export const applyContent = (snapshot: AiContentSnapshot): void => setPersistedData(snapshot);

export const applySchema = (snapshot: AiSchemaSnapshot): void => setSchema(snapshot);

export const applyLanguage = (snapshot: AiLanguageSnapshot): void => setLanguage(snapshot);

export const openDialog = (): void => {
  if (!$dialog.get().visible) {
    setDialogView('preparation');
    toggleDialog();
  }
};
