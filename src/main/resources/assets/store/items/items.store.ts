import { batched, map } from 'nanostores';

import type { Items, ItemsState } from './items.types';

export const $items = map<Items>({
  paths: [],
  remaining: [],
  succeeded: [],
  failed: [],
});

export const $itemsState = batched($items, ({ paths, remaining, globalFailure }): ItemsState => {
  if (globalFailure) {
    return 'failed';
  }
  if (paths.length > 0 && remaining.length === 0) {
    return 'completed';
  }
  if (paths.length > 0 && remaining.length > 0) {
    return 'processing';
  }
  return 'initial';
});
