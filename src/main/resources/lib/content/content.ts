import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import * as schemaLib from '/lib/xp/schema';
import {Content, FormItem} from '/lib/xp/content';
import {User} from '/lib/xp/context';

import {
    FragmentComponent,
    LayoutComponent,
    PageComponent,
    PartComponent,
    Region,
    TextComponent,
} from '@enonic-types/core';
import {ComponentDescriptor, ComponentDescriptorType, XDataSchema} from '@enonic-types/lib-schema';

import {TOPIC_NAME} from '../../shared/constants';
import {ERRORS} from '../../shared/errors';
import {logError, logWarn} from '../logger';
import {isRecordEmpty} from '../utils/objects';
import {DataEntry, flattenData} from './data';
import {FormItemWithPath, getPathsToTranslatableFields, InputWithPath, isInput} from './form';
import {isLayoutComponent, isPageComponent, isPartComponent, isTextComponent} from './page';
import {pathToString} from './path';
import {Property, PropertyValue} from './property';

type ContextUser = Pick<User, 'login' | 'idProvider'> | undefined;

export function getTranslatableDataFromContent(
    contentId: string,
    project: string,
    user: ContextUser | undefined,
): Try<Record<string, DataEntry>> {
    try {
        const content = getContent(contentId, project, user);
        if (!content) {
            const msg = `Searched for "${contentId}" in "${project}" project under ${user?.login ?? 'anonymous'} user`;
            return [null, ERRORS.QUERY_CONTENT_NOT_FOUND.withMsg(msg)];
        }

        const contentType = contentLib.getType(content.type);

        if (!contentType) {
            const msg = `Searched for type "${content.type}"`;
            return [null, ERRORS.QUERY_CONTENT_TYPE_NOT_FOUND.withMsg(msg)];
        }

        const flatData = flattenData(content.data);
        const dataToTranslate = getTranslatableFields(flatData, contentType.form);
        const result: Record<string, DataEntry> = {};

        for (const dataPath in dataToTranslate) {
            result[`__data__${dataPath}`] = dataToTranslate[dataPath];
        }

        if (content.displayName) {
            result[`__data__/${TOPIC_NAME}`] = makeDisplayNameDataEntry(content.displayName, contentType.description);
        }

        const flatXData = flattenData(content.x as Record<string, Property>);
        const xDataToTranslate = getXDataFieldsToTranslate(flatXData);

        for (const xDataPath in xDataToTranslate) {
            result[`__xdata__/${xDataPath}`] = xDataToTranslate[xDataPath];
        }

        const pageDataToTranslate = getPageDataEntries(content);

        for (const pagePath in pageDataToTranslate) {
            result[`__page__${pagePath}`] = pageDataToTranslate[pagePath];
        }

        if (isRecordEmpty(result)) {
            return [null, ERRORS.FUNC_NO_TRANSLATABLE_FIELDS];
        }

        return [result, null];
    } catch (e) {
        logError(e);
        return [null, ERRORS.UNKNOWN_ERROR.withMsg(`Failed to fetch translatable fields from content "${contentId}"`)];
    }
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

function getContent(
    contentId: string,
    project: string,
    user: ContextUser | undefined,
): Content<Record<string, Property>> | null {
    return contextLib.run(
        {
            repository: `com.enonic.cms.${project}`,
            branch: 'draft',
            user: user && {
                login: user.login,
                idProvider: user.idProvider,
            },
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

        if (schemaPrefix && !schemas[schemaPrefix] && !isBuiltInSchema(schemaPrefix)) {
            const schema = getSchema(schemaPrefix);

            if (schema) {
                schemas[schemaPrefix] = schema;
            }
        }
    }

    return schemas;
}

function makeSchemaPrefix(path: string): string | undefined {
    const pathParts = path.split('/');
    return pathParts.length > 2 ? `${pathParts[0]}/${pathParts[1]}` : undefined;
}

function isBuiltInSchema(schemaPrefix: string): boolean {
    return schemaPrefix.startsWith('media/') || schemaPrefix.startsWith('base/');
}

function getSchema(xDataPath: string): XDataSchema | undefined {
    const pathParts = xDataPath.split('/');
    const schemaKey = `${pathParts[0].replace(/-/g, '.')}:${pathParts[1]}`; // replace dashes with dots
    let schema;

    try {
        // https://github.com/enonic/xp/issues/10425, try-catch can be removed after xp version is set to 7.15
        schema = contextLib.run(
            {
                principals: ['role:system.admin'],
            },
            () => schemaLib.getSchema({name: schemaKey, type: 'XDATA'}),
        );
    } catch (e) {
        logWarn(`Failed to fetch schema for xData: ${schemaKey}`);
    }

    return schema;
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

function getPageDataEntries(content: Content): Record<string, DataEntry> {
    if (content.page) {
        return getFieldsToTranslateFromComponent(content.page);
    }

    if (content.fragment) {
        return getFieldsToTranslateFromComponent(content.fragment);
    }

    return {};
}

function getComponent(key: string, type: ComponentDescriptorType): ComponentDescriptor {
    return contextLib.run(
        {
            principals: ['role:system.admin'],
        },
        () => schemaLib.getComponent({key, type}),
    ) as ComponentDescriptor;
}

function getRegionFieldsToTranslate(
    region: Region<(FragmentComponent | LayoutComponent | PartComponent | TextComponent)[]>,
): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = {};

    region.components.forEach(component => {
        const componentFields = getFieldsToTranslateFromComponent(component);

        for (const path in componentFields) {
            result[path] = componentFields[path];
        }
    });

    return result;
}

function getFieldsToTranslateFromComponent(
    component: PageComponent | FragmentComponent | LayoutComponent | PartComponent | TextComponent,
): Record<string, DataEntry> {
    if (isPageComponent(component)) {
        return getFieldsToTranslateFromRegionsBasedComponent(component);
    }

    if (isTextComponent(component)) {
        return makeTextComponentField(component);
    }

    if (isPartComponent(component)) {
        return getDescriptorBasedComponentConfigFields(component, 'PART');
    }

    if (isLayoutComponent(component)) {
        return getFieldsToTranslateFromRegionsBasedComponent(component);
    }

    return {};
}

function makeTextComponentField(component: TextComponent): Record<string, DataEntry> {
    return {
        [component.path]: {
            value: component.text,
            type: 'html',
            schemaType: 'HtmlArea',
            schemaLabel: '',
        },
    };
}

function getDescriptorBasedComponentConfigFields(
    component: PartComponent | LayoutComponent | PageComponent,
    type: 'PART' | 'LAYOUT' | 'PAGE',
): Record<string, DataEntry> {
    if (!component.descriptor) {
        return {};
    }

    const descriptor = getComponent(component.descriptor, type);
    const config = component.config as Record<string, Property>;
    const flatConfig = flattenData(config);

    const fields = getTranslatableFields(flatConfig, descriptor.form);
    const result: Record<string, DataEntry> = {};

    for (const path in fields) {
        result[makeConfigDataEntryKey(component, path)] = fields[path];
    }

    return result;
}

function makeConfigDataEntryKey(component: PartComponent | LayoutComponent | PageComponent, path: string): string {
    const pathToConfigPrefix = isPageComponent(component) ? '' : component.path || '';
    return `${pathToConfigPrefix}/__config__${path}`;
}

function getFieldsToTranslateFromRegionsBasedComponent(
    component: PageComponent | LayoutComponent,
): Record<string, DataEntry> {
    const result: Record<string, DataEntry> = getDescriptorBasedComponentConfigFields(
        component,
        isPageComponent(component) ? 'PAGE' : 'LAYOUT',
    );

    for (const regionName in component.regions) {
        const regionComponents = getRegionFieldsToTranslate(component.regions[regionName]);

        for (const path in regionComponents) {
            result[path] = regionComponents[path];
        }
    }

    return result;
}
