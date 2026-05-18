import { computed, map } from 'nanostores';

import { $config } from '@/store/config';

import type { Dialog } from './dialog.types';

export const $dialog = map<Dialog>({
  visible: false,
  view: 'preparation',
});

export const $instructions = computed([$dialog, $config], (dialog, config) => {
  return dialog.instructions ?? config.instructions ?? '';
});
