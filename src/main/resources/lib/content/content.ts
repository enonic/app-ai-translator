import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import {Content} from '/lib/xp/content';

import {isRecordEmpty} from '../utils/objects';
import {DataEntry, flattenData} from './data';
import {getPathsToTranslatableFields, InputWithPath} from './form';
import {pathToString} from './path';
import {Property, PropertyValue} from './property';

export function getTranslatableDataFromContent(contentId: string, context: string): Record<string, DataEntry> {
    const content = getContent(contentId, context);
    const contentType = content && contentLib.getType(content.type);

    if (!content || !contentType) {
        return {};
    }

    const flatData = flattenData(content.data as Record<string, Property>);
    const toTranslate = getTranslatableFields(flatData, contentType);

    if (content.displayName) {
        assignTopic(toTranslate, content.displayName, contentType.description);
    }

    return toTranslate;
}

function getTranslatableFields(
    flatData: Record<string, PropertyValue>,
    contentType: contentLib.ContentType,
): Record<string, DataEntry> {
    if (isRecordEmpty(flatData)) {
        return {};
    }

    const formItemsWithPath: InputWithPath[] = getPathsToTranslatableFields(contentType.form) as InputWithPath[];
    return mapDataToFormItems(flatData, formItemsWithPath);
}

function getContent(contentId: string, context: string): Content<unknown> {
    return contextLib.run(
        {
            repository: 'com.enonic.cms.' + context,
            branch: 'draft',
        },
        () => {
            return contentLib.get({key: contentId}) as Content<unknown>;
        },
    );
}

function mapDataToFormItems(
    data: Record<string, PropertyValue>,
    formItemsWithPath: InputWithPath[],
): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = {};

    formItemsWithPath.forEach((formItemWithPath: InputWithPath): void => {
        for (const key in data) {
            const value = data[key];
            const keyNoIndex = key.replace(/\[\d+\]/g, '');

            if (keyNoIndex === pathToString(formItemWithPath)) {
                result[processKeyForOutput(key)] = {
                    value,
                    type: getPathType(formItemWithPath),
                    schemaType: formItemWithPath.inputType,
                    schemaLabel: formItemWithPath.label,
                    schemaHelpText: formItemWithPath.helpText,
                };
            }
        }
    });

    return result;
}

function getPathType(path: InputWithPath | undefined): 'html' | 'text' {
    return path?.inputType === 'HtmlArea' ? 'html' : 'text';
}

// Adjusting path format with the one used in elements data-path attributes
function processKeyForOutput(key: string): string {
    const keyNoZeroIndexes = key.replace(/\[0\]/g, '');
    return `/${keyNoZeroIndexes}`;
}

function assignTopic(
    target: Record<string, DataEntry>,
    displayName: string,
    context: string,
): Record<string, DataEntry> {
    target['__topic__'] = makeDisplayNameDataEntry(displayName, context);
    return target;
}

function makeDisplayNameDataEntry(displayName: string, context: string): DataEntry {
    return {
        value: displayName,
        type: 'text',
        schemaType: 'TextLine',
        schemaLabel: context,
    };
}
