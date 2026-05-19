import { describe, expect, it } from 'vitest';

import type { AiFieldPath } from './ai-protocol';
import { toKey } from './ai-field-path';

describe('toKey', () => {
  it('is stable for the same path', () => {
    const path: AiFieldPath = { kind: 'data', field: 'foo.bar' };
    expect(toKey(path)).toBe(toKey({ kind: 'data', field: 'foo.bar' }));
  });

  it('distinguishes different kinds', () => {
    expect(toKey({ kind: 'topic' })).not.toBe(toKey({ kind: 'data', field: '' }));
  });

  it('distinguishes mixin paths by mixin and field', () => {
    const a = toKey({ kind: 'mixin', mixin: 'app:M', field: 'a' });
    const b = toKey({ kind: 'mixin', mixin: 'app:M', field: 'b' });
    expect(a).not.toBe(b);
  });

  it('round-trips kind + members into one string', () => {
    expect(toKey({ kind: 'componentConfig', component: '/main/0', field: 'caption' }))
      .toBe('componentConfig:/main/0:caption');
  });
});
