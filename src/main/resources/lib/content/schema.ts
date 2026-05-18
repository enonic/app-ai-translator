import type { FormFragmentSchema, MixinSchema } from '/lib/xp/schema';
import * as schemaLib from '/lib/xp/schema';

import { runAsAdmin } from '../utils/context';
import type { PropertyValue } from './property';

function getMixinSchema(mixinPath: string): Optional<MixinSchema> {
  const pathParts = mixinPath.split('/');
  const schemaKey = `${pathParts[0].replace(/-/g, '.')}:${pathParts[1]}`; // replace dashes with dots
  return runAsAdmin(
    () => schemaLib.getSchema({ name: schemaKey, type: 'MIXIN' }),
  ) as Optional<MixinSchema>;
}

export function getFormFragmentSchema(name: string): Optional<FormFragmentSchema> {
  return runAsAdmin(() => schemaLib.getSchema({ name, type: 'FORM_FRAGMENT' }));
}

// Grouping mixin schemas by appName/mixinName key
export function getMixinSchemas(
  mixins: Record<string, PropertyValue>,
): Record<string, MixinSchema> {
  const schemas: Record<string, MixinSchema> = {};

  for (const path in mixins) {
    const schemaPrefix = makeSchemaPrefix(path);

    if (schemaPrefix && !schemas[schemaPrefix] && !isBuiltInSchema(schemaPrefix)) {
      const schema = getMixinSchema(schemaPrefix);

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
