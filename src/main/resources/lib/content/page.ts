import {Component, LayoutComponent, PageComponent, PartComponent, TextComponent} from '@enonic-types/core';

export const isLayoutComponent = (component: Component): component is LayoutComponent => component.type === 'layout';

export const isPageComponent = (component: Component): component is PageComponent => component.type === 'page';

export const isPartComponent = (component: Component): component is PartComponent => component.type === 'part';

export const isTextComponent = (component: Component): component is TextComponent => component.type === 'text';
