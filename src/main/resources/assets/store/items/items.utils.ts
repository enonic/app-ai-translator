import { toKey } from '@shared/ai-field-path';
import type { AiFieldPath } from '@shared/ai-protocol';

import { $items } from './items.store';

export function setPaths(paths: AiFieldPath[]): void {
  $items.set({
    paths,
    remaining: paths,
    succeeded: [],
    failed: [],
  });
}

export function resetItems(): void {
  setPaths([]);
}

export function addSucceeded(path: AiFieldPath): void {
  const { succeeded, remaining } = $items.get();
  const key = toKey(path);
  const newRemaining = remaining.filter((p) => toKey(p) !== key);
  if (newRemaining.length < remaining.length) {
    $items.setKey('succeeded', [...succeeded, path]);
    $items.setKey('remaining', newRemaining);
  }
}

export function addFailed(path: AiFieldPath, reason: string): void {
  const { failed, remaining } = $items.get();
  const key = toKey(path);
  const newRemaining = remaining.filter((p) => toKey(p) !== key);
  if (newRemaining.length < remaining.length) {
    $items.setKey('failed', [...failed, { path, reason }]);
    $items.setKey('remaining', newRemaining);
  }
}

export function setGlobalFailure(reason: string): void {
  const { failed, remaining } = $items.get();
  $items.setKey('globalFailure', reason);
  $items.setKey('failed', [...failed, ...remaining.map((p) => ({ path: p, reason }))]);
  $items.setKey('remaining', []);
}

export function skipRemaining(): void {
  const { remaining, succeeded } = $items.get();
  $items.setKey('remaining', []);
  $items.setKey('succeeded', [...succeeded, ...remaining]);
}
