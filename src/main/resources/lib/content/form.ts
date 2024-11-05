import {FormItemLayout, FormItemOptionSet, FormItemSet} from '@enonic-types/core';
import {FormItem, FormItemInput} from '@enonic-types/lib-content';

import {Path} from './path';

export type FormOptionSetOption = {
    name: string;
    label: string;
    items: FormItem[];
};

export const isInput = (item: FormItem): item is FormItemInput => item.formItemType === 'Input';

export const isFormItemSet = (item: FormItem): item is FormItemSet => item.formItemType === 'ItemSet';

export const isFieldSet = (item: FormItem): item is FormItemLayout => item.formItemType === 'Layout';

export const isFormItemOptionSet = (item: FormItem): item is FormItemOptionSet => item.formItemType === 'OptionSet';

export type FormItemWithPath = FormItem & Path;

export type InputWithPath = FormItemInput & Path;

export type FormItemSetWithPath = FormItemSet & Path;

export type FormOptionSetWithPath = FormItemOptionSet & Path;

export function getPathsToTranslatableFields(formItems: FormItem[]): FormItemWithPath[] {
    const result: FormItemWithPath[] = [];
    result.push(...getPathsOfMentionableItems(formItems, {elements: []}));
    return result;
}

function getPathsOfMentionableItems(formItems: FormItem[], path: Path): FormItemWithPath[] {
    const result: FormItemWithPath[] = [];

    formItems.forEach(item => {
        result.push(...fetchFormItemPath(item, path));
    });

    return result;
}

function fetchFormItemPath(item: FormItem, path: Path): FormItemWithPath[] {
    if (isInput(item)) {
        return isInputToEdit(item) ? [getInputPathEntry(item, path)] : [];
    }

    if (isFieldSet(item)) {
        return getPathsOfMentionableItems(item.items, {elements: path.elements.slice()});
    }

    if (isFormItemSet(item)) {
        return getFormItemSetPathEntries(item, path);
    }

    if (isFormItemOptionSet(item)) {
        return getFormOptionSetPathEntries(item, path);
    }

    return [];
}

function isInputToEdit(item: FormItemInput): boolean {
    const inputType = item.inputType;
    return inputType === 'TextArea' || inputType === 'TextLine' || inputType === 'HtmlArea';
}

function getInputPathEntry(item: FormItemInput, path: Path): InputWithPath {
    const pathElements = path.elements.slice();
    pathElements.push({name: item.name, label: item.label});
    return {elements: pathElements, ...item};
}

function getFormItemSetPathEntries(item: FormItemSet, path: Path): FormItemWithPath[] {
    const pathElements = path.elements.slice();
    pathElements.push({name: item.name, label: item.label});

    const formItemSetItemWithPath: FormItemSetWithPath = {
        elements: pathElements.slice(),
        ...item,
    };

    return [formItemSetItemWithPath, ...getPathsOfMentionableItems(item.items, {elements: pathElements})];
}

function getFormOptionSetPathEntries(item: FormItemOptionSet, path: Path): FormItemWithPath[] {
    const pathElements = path.elements.slice();

    pathElements.push({name: item.name, label: item.label});

    const result: FormItemWithPath[] = [];

    const formOptionSetWithPath: FormOptionSetWithPath = {
        elements: pathElements.slice(),
        ...item,
    };

    result.push(formOptionSetWithPath);

    item.options.forEach((option: FormOptionSetOption) => {
        result.push(...getFormOptionSetOptionPathEntries(option, {elements: pathElements}));
    });

    return result;
}

function getFormOptionSetOptionPathEntries(option: FormOptionSetOption, path: Path): FormItemWithPath[] {
    const pathElements = path.elements.slice();
    pathElements.push({name: option.name, label: option.label});

    const optionFormItemWithPath: FormItemWithPath = {
        elements: pathElements.slice(),
        items: option.items,
        name: option.name,
        label: option.label,
        formItemType: 'Layout', // had to use it to make the type check pass since there's no 'OptionSetOption' type
    };

    return [optionFormItemWithPath, ...getPathsOfMentionableItems(option.items, {elements: pathElements})];
}
