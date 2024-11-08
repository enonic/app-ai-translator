import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import * as schemaLib from '/lib/xp/schema';
import {Content, FormItem} from '/lib/xp/content';

import {XDataSchema} from '@enonic-types/lib-schema';

import {TOPIC_NAME} from '../../shared/constants';
import {isRecordEmpty} from '../utils/objects';
import {DataEntry, flattenData} from './data';
import {FormItemWithPath, getPathsToTranslatableFields, InputWithPath, isInput} from './form';
import {pathToString} from './path';
import {Property, PropertyValue} from './property';

export function getTranslatableDataFromContent(contentId: string, context: string): Record<string, DataEntry> {
    const content = getContent(contentId, context);
    const contentType = content && contentLib.getType(content.type);

    if (!content || !contentType) {
        return {};
    }

    const flatData = flattenData(content.data);
    const dataToTranslate = getTranslatableFields(flatData, contentType.form);

    if (content.displayName) {
        dataToTranslate[TOPIC_NAME] = makeDisplayNameDataEntry(content.displayName, contentType.description);
    }

    const flatXData = flattenData(content.x as Record<string, Property>);
    const xDataToTranslate = getXDataFieldsToTranslate(flatXData);

    for (const xDataPath in xDataToTranslate) {
        dataToTranslate[`__xdata__/${xDataPath}`] = xDataToTranslate[xDataPath];
    }

    return dataToTranslate;
}

function getTranslatableFields(flatData: Record<string, PropertyValue>, form: FormItem[]): Record<string, DataEntry> {
    if (isRecordEmpty(flatData)) {
        return {};
    }

    const formItemsWithPath = getPathsToTranslatableFields(form).filter(
        (item: FormItemWithPath): item is InputWithPath => isInput(item),
    );
    return mapDataToFormItems(flatData, formItemsWithPath);
}

function getContent(contentId: string, context: string): Content<Record<string, Property>> | null {
    return contextLib.run(
        {
            repository: `com.enonic.cms.${context}`,
            branch: 'draft',
        },
        () => contentLib.get({key: contentId}),
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

function getPathType(path: Optional<InputWithPath>): 'html' | 'text' {
    return path?.inputType === 'HtmlArea' ? 'html' : 'text';
}

// Adjusting path format with the one used in elements data-path attributes
function processKeyForOutput(key: string): string {
    return `/${key.replace(/\[0\]/g, '')}`;
}

function makeDisplayNameDataEntry(displayName: string, context: string): DataEntry {
    return {
        value: displayName,
        type: 'text',
        schemaType: 'TextLine',
        schemaLabel: context,
    };
}

/*
 * XData fields are stored with a prefix that includes the app name and the xData name.
 * Meanwhile the schema form that we fetch has no such prefix. We need to match the schema form fields with the actual xData fields.
 */
function getXDataFieldsToTranslate(xData: Record<string, PropertyValue>): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = {};
    const schemas = getXDataSchemas(xData);

    for (const schemaPrefix in schemas) {
        const entriesByXData = getXDataEntriesBySchemaPrefix(xData, schemaPrefix);
        const xDataItemsToTranslate = getTranslatableFields(entriesByXData, schemas[schemaPrefix].form);

        for (const path in xDataItemsToTranslate) {
            result[`${schemaPrefix}${path}`] = xDataItemsToTranslate[path];
        }
    }

    return result;
}

// Grouping x data schemas by appName/xDataName key
function getXDataSchemas(xData: Record<string, PropertyValue>): Record<string, XDataSchema> {
    const schemas: Record<string, XDataSchema> = {};

    for (const path in xData) {
        const schemaPrefix = makeSchemaPrefix(path);

        if (schemaPrefix && !schemas[schemaPrefix]) {
            schemas[schemaPrefix] = getSchema(schemaPrefix);
        }
    }

    return schemas;
}

function makeSchemaPrefix(path: string): string | undefined {
    const pathParts = path.split('/');
    return pathParts.length > 2 ? `${pathParts[0]}/${pathParts[1]}` : undefined;
}

function getSchema(xDataPath: string): XDataSchema {
    const pathParts = xDataPath.split('/');
    const schemaKey = `${pathParts[0].replace(/-/g, '.')}:${pathParts[1]}`; // replace dashes with dots

    return contextLib.run(
        {
            principals: ['role:system.admin'],
        },
        () => schemaLib.getSchema({name: schemaKey, type: 'XDATA'}),
    );
}

function getXDataEntriesBySchemaPrefix(
    xData: Record<string, PropertyValue>,
    schemaPrefix: string,
): Record<string, PropertyValue> {
    const result: Record<string, PropertyValue> = {};
    const schemaPrefixWithSeparator = `${schemaPrefix}/`;

    for (const path in xData) {
        if (path.startsWith(schemaPrefixWithSeparator)) {
            result[path.replace(schemaPrefixWithSeparator, '')] = xData[path];
        }
    }

    return result;
}
