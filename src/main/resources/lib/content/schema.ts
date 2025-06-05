import * as schemaLib from '/lib/xp/schema';
import type {MixinSchema, XDataSchema} from '/lib/xp/schema';

import {runAsAdmin} from '../utils/context';
import {PropertyValue} from './property';

function getXDataSchema(xDataPath: string): Optional<XDataSchema> {
    const pathParts = xDataPath.split('/');
    const schemaKey = `${pathParts[0].replace(/-/g, '.')}:${pathParts[1]}`; // replace dashes with dots
    return runAsAdmin(() => schemaLib.getSchema({name: schemaKey, type: 'XDATA'}));
}

export function getMixinSchema(name: string): Optional<MixinSchema> {
    return runAsAdmin(() => schemaLib.getSchema({name, type: 'MIXIN'}));
}

// Grouping x data schemas by appName/xDataName key
export function getXDataSchemas(xData: Record<string, PropertyValue>): Record<string, XDataSchema> {
    const schemas: Record<string, XDataSchema> = {};

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
