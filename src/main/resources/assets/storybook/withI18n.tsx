import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import type { Decorator } from '@storybook/preact-vite';

// Mirrors phrases_en.json so stories render real English strings instead of bare keys.
const phrases: Record<string, string> = {
  'action.translate': 'Translate',
  'action.cancel': 'Cancel',
  'action.close': 'Close',
  'action.addInstructions': 'Add translation instructions',
  'field.title': 'AI Automated Translation',
  'field.instructions.title': 'Translation instructions',
  'field.instructions.placeholder':
    'Write text translation instructions. The general instructions configured via site will also be added here.',
  'text.greeting': 'Hey! Want me to translate texts to <0/> ?',
  'text.assistant.name': 'Juke AI',
  'text.translating.preparing': 'Initiating translation...',
  'text.translating.progress':
    'Translating to <framed>{{language}}</framed>: <bold>{{progress}}</bold> of <bold>{{total}}</bold> completed.',
  'text.result.completed': 'All translations are finished! You can safely close this dialog now.',
  'text.result.failed.some':
    'Translation finished with <bold>{{count}}</bold> errors. Contact administrator or try again later.',
  'text.result.failed.all': 'Unable to complete translation. Reason: <italic>{{reason}}</italic>',
};

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['phrases'],
  defaultNS: 'phrases',
  resources: { en: { phrases } },
  interpolation: { escapeValue: false },
});

export const withI18n: Decorator = (Story) => (
  <I18nextProvider i18n={i18n}>
    <Story />
  </I18nextProvider>
);
