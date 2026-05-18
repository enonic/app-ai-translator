import { describe, expect, it } from 'vitest';

import type { AiFieldPath } from '../../shared/ai-protocol';
import type { LayoutComponent, PageComponent, PartComponent } from '/lib/xp/core';

import { makeConfigFieldPath, makeMixinFieldPath, toFieldName } from './content';

describe('toFieldName', () => {
  it('strips a leading slash and converts separators to dots', () => {
    expect(toFieldName('/foo/bar')).toBe('foo.bar');
  });

  it('handles a single-segment path', () => {
    expect(toFieldName('/heading')).toBe('heading');
  });

  it('leaves a path without a leading slash intact apart from separators', () => {
    expect(toFieldName('foo/bar')).toBe('foo.bar');
  });
});

describe('content data field path', () => {
  it('maps a flattened content data field to a data path', () => {
    const path: AiFieldPath = { kind: 'data', field: toFieldName('/foo/bar') };
    expect(path).toEqual({ kind: 'data', field: 'foo.bar' });
  });
});

describe('makeMixinFieldPath', () => {
  it('maps a mixin field to a mixin path keyed by app and mixin name', () => {
    const path = makeMixinFieldPath('com.enonic.app.x/MyMixin', '/heading');
    expect(path).toEqual({
      kind: 'mixin',
      mixin: 'com.enonic.app.x:MyMixin',
      field: 'heading',
    });
  });

  it('keeps app-name dots and flattens nested mixin field paths', () => {
    const path = makeMixinFieldPath('com.enonic.app.x/MyMixin', '/group/title');
    expect(path).toEqual({
      kind: 'mixin',
      mixin: 'com.enonic.app.x:MyMixin',
      field: 'group.title',
    });
  });
});

describe('makeConfigFieldPath', () => {
  const partComponent = { type: 'part', path: '/main/1' } as unknown as PartComponent;
  const layoutComponent = { type: 'layout', path: '/main/2' } as unknown as LayoutComponent;
  const pageComponent = { type: 'page', path: '' } as unknown as PageComponent;

  it('maps a part config field to a componentConfig path', () => {
    expect(makeConfigFieldPath(partComponent, '/caption')).toEqual({
      kind: 'componentConfig',
      component: '/main/1',
      field: 'caption',
    });
  });

  it('maps a layout config field to a componentConfig path', () => {
    expect(makeConfigFieldPath(layoutComponent, '/caption')).toEqual({
      kind: 'componentConfig',
      component: '/main/2',
      field: 'caption',
    });
  });

  it('maps the page component config field to a pageConfig path', () => {
    expect(makeConfigFieldPath(pageComponent, '/header')).toEqual({
      kind: 'pageConfig',
      field: 'header',
    });
  });
});

describe('text component path', () => {
  it('maps a text component to a componentText path', () => {
    const path: AiFieldPath = { kind: 'componentText', component: '/main/0' };
    expect(path).toEqual({ kind: 'componentText', component: '/main/0' });
  });
});

describe('topic path', () => {
  it('maps the display name to a topic path', () => {
    const path: AiFieldPath = { kind: 'topic' };
    expect(path).toEqual({ kind: 'topic' });
  });
});
