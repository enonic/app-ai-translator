import type { FormFragmentSchema, MixinSchema } from '/lib/xp/schema';
import * as schemaLib from '/lib/xp/schema';

import { runAsAdmin } from '../utils/context';
import type { PropertyValue } from './property';

function getFormFragmentSchema(xDataPath: string): Optional<FormFragmentSchema> {
  const pathParts = xDataPath.split('/');
  const schemaKey = `${pathParts[0].replace(/-/g, '.')}:${pathParts[1]}`; // replace dashes with dots
  return runAsAdmin(() => schemaLib.getSchema({ name: schemaKey, type: 'FORM_FRAGMENT' }));
}

export function getMixinSchema(name: string): Optional<MixinSchema> {
  return runAsAdmin(() => schemaLib.getSchema({ name, type: 'MIXIN' })) as Optional<MixinSchema>;
}

// Grouping x data schemas by appName/xDataName key
export function getFormFragmentSchemas(
  xData: Record<string, PropertyValue>,
): Record<string, FormFragmentSchema> {
  const schemas: Record<string, FormFragmentSchema> = {};

  for (const path in xData) {
    const schemaPrefix = makeSchemaPrefix(path);

    if (schemaPrefix && !schemas[schemaPrefix] && !isBuiltInSchema(schemaPrefix)) {
      const schema = getFormFragmentSchema(schemaPrefix);

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
