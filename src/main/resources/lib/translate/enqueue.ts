import type { TranslatableEntry } from '../content/content';
import type { TranslateFieldPayload } from './results';

import { addTask, TRANSLATE_FIELD_DESCRIPTOR } from './queue';

export type TranslationConfig = {
  fields: TranslatableEntry[];
  contentId: string;
  project: string;
  targetLanguage: string;
  customInstructions?: string;
};

export function translateFields(config: TranslationConfig, sessionId: string): void {
  const { fields, targetLanguage, customInstructions } = config;

  fields.forEach((field: TranslatableEntry): void => {
    const payload: TranslateFieldPayload = {
      sessionId,
      path: field.path,
      entry: field.entry,
      targetLanguage,
      customInstructions,
    };

    addTask(
      {
        descriptor: TRANSLATE_FIELD_DESCRIPTOR,
        config: { payload: JSON.stringify(payload) },
      },
      sessionId,
    );
  });
}
