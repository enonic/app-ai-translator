import { map } from 'nanostores';

import type { Content } from './content.types';

export const $content = map<Content>({
  language: {
    tag: navigator?.language ?? 'en',
    name: 'English',
  },
  persisted: null,
  schema: null,
});
