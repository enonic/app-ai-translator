import type { AiFieldPath } from './ai-protocol';

// Deterministic string key for an AiFieldPath. Translator-local: used to key the
// server's results map and any client-side lookup. NOT part of the protocol —
// keys never cross the CS<->plugin seam.
export function toKey(path: AiFieldPath): string {
  switch (path.kind) {
    case 'topic':
      return 'topic';
    case 'data':
      return `data:${path.field}`;
    case 'mixin':
      return `mixin:${path.mixin}:${path.field}`;
    case 'pageConfig':
      return `pageConfig:${path.field}`;
    case 'componentText':
      return `componentText:${path.component}`;
    case 'componentConfig':
      return `componentConfig:${path.component}:${path.field}`;
  }
}
