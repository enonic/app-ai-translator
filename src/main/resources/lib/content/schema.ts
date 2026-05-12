import * as schemaLib from '/lib/xp/schema';
import type {FormFragmentSchema, MixinSchema} from '/lib/xp/schema';

import {runAsAdmin} from '../utils/context';
import {PropertyValue} from './property';

function getXDataSchema(xDataPath: string): Optional<MixinSchema> {
    const pathParts = xDataPath.split('/');
    const schemaKey = `${pathParts[0].replace(/-/g, '.')}:${pathParts[1]}`; // replace dashes with dots
    const schema = runAsAdmin(() => schemaLib.getSchema({name: schemaKey, type: 'MIXIN'}));
    return schema && schema.type === 'MIXIN' ? (schema as MixinSchema) : undefined;
}

export function getMixinSchema(name: string): Optional<FormFragmentSchema> {
    const schema = runAsAdmin(() => schemaLib.getSchema({name, type: 'FORM_FRAGMENT'}));
    return schema && schema.type === 'FORM_FRAGMENT' ? (schema as FormFragmentSchema) : undefined;
}

// Grouping x data schemas by appName/xDataName key
export function getXDataSchemas(xData: Record<string, PropertyValue>): Record<string, MixinSchema> {
    const schemas: Record<string, MixinSchema> = {};

    for (const path in xData) {
        const schemaPrefix = makeSchemaPrefix(path);

        if (schemaPrefix && !schemas[schemaPrefix] && !isBuiltInSchema(schemaPrefix)) {
            const schema = getXDataSchema(schemaPrefix);

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
