import * as contentLib from '/lib/xp/content';
import * as contextLib from '/lib/xp/context';
import * as schemaLib from '/lib/xp/schema';

import type { AiFieldPath } from '../../shared/ai-protocol';
import type { TextType } from '../../shared/types/text';
import type { DataEntry } from './data';
import type { FormItemWithPath, InputWithPath } from './form';
import type { Property, PropertyValue } from './property';
import type { Content, FormItem } from '/lib/xp/content';
import type { User } from '/lib/xp/context';
import type {
  FragmentComponent,
  LayoutComponent,
  PageComponent,
  PartComponent,
  Region,
  TextComponent,
} from '/lib/xp/core';
import type { ComponentDescriptor, ComponentDescriptorType } from '/lib/xp/schema';

import { ERRORS } from '../../shared/errors';
import { logError } from '../logger';
import { runAsAdmin } from '../utils/context';
import { isRecordEmpty } from '../utils/objects';
import { flattenData } from './data';
import { getPathsToTranslatableFields, isInput } from './form';
import { isLayoutComponent, isPageComponent, isPartComponent, isTextComponent } from './page';
import { pathToString } from './path';
import { getMixinSchemas } from './schema';

type ContextUser = Pick<User, 'login' | 'idProvider'> | undefined;

export type TranslatableEntry = {
  path: AiFieldPath;
  entry: DataEntry;
};

// Normalizes a flattened data key into an AiFieldPath `field`: strips a leading
// slash (if any) and converts `/` separators into `.`.
export function toFieldName(path: string): string {
  return path.replace(/^\//, '').replace(/\//g, '.');
}

export function getTranslatableDataFromContent(
  contentId: string,
  project: string,
  user: ContextUser | undefined,
): Try<TranslatableEntry[]> {
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
    const result: TranslatableEntry[] = [];

    for (const dataPath in dataToTranslate) {
      result.push({
        path: { kind: 'data', field: toFieldName(dataPath) },
        entry: dataToTranslate[dataPath],
      });
    }

    if (content.displayName) {
      result.push({
        path: { kind: 'topic' },
        entry: makeDisplayNameDataEntry(content.displayName, contentType.description),
      });
    }

    const flatMixins = flattenData(content.x as Record<string, Property>);
    result.push(...getMixinEntriesToTranslate(flatMixins));

    result.push(...getPageEntriesToTranslate(content));

    if (result.length === 0) {
      return [null, ERRORS.FUNC_NO_TRANSLATABLE_FIELDS];
    }

    return [result, null];
  } catch (e) {
    logError(e);
    return [
      null,
      ERRORS.UNKNOWN_ERROR.withMsg(
        `Failed to fetch translatable fields from content "${contentId}"`,
      ),
    ];
  }
}

function getTranslatableFields(
  flatData: Record<string, PropertyValue>,
  form: FormItem[],
): Record<string, DataEntry> {
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
    () => contentLib.get({ key: contentId }),
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

function getPathType(path: Optional<InputWithPath>): TextType {
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
 * Mixin fields are stored with a prefix that includes the app name and the mixin name.
 * Meanwhile the schema form that we fetch has no such prefix. We need to match the schema form fields with the actual mixin fields.
 */
function getMixinEntriesToTranslate(
  mixins: Record<string, PropertyValue>,
): TranslatableEntry[] {
  const result: TranslatableEntry[] = [];
  const schemas = getMixinSchemas(mixins);

  for (const schemaPrefix in schemas) {
    const entriesByMixins = getMixinEntriesBySchemaPrefix(mixins, schemaPrefix);
    const mixinItemsToTranslate = getTranslatableFields(
      entriesByMixins,
      schemas[schemaPrefix].form,
    );

    for (const path in mixinItemsToTranslate) {
      result.push({
        path: makeMixinFieldPath(schemaPrefix, path),
        entry: mixinItemsToTranslate[path],
      });
    }
  }

  return result;
}

// `schemaPrefix` is exactly `appName/mixinName`; the app name keeps its dots
// because it contains no slashes at this point.
export function makeMixinFieldPath(schemaPrefix: string, path: string): AiFieldPath {
  const separatorIndex = schemaPrefix.indexOf('/');
  const appName = schemaPrefix.slice(0, separatorIndex);
  const mixinName = schemaPrefix.slice(separatorIndex + 1);
  return {
    kind: 'mixin',
    mixin: `${appName}:${mixinName}`,
    field: toFieldName(path),
  };
}

function getMixinEntriesBySchemaPrefix(
  mixins: Record<string, PropertyValue>,
  schemaPrefix: string,
): Record<string, PropertyValue> {
  const result: Record<string, PropertyValue> = {};
  const schemaPrefixWithSeparator = `${schemaPrefix}/`;

  for (const path in mixins) {
    if (path.startsWith(schemaPrefixWithSeparator)) {
      result[path.replace(schemaPrefixWithSeparator, '')] = mixins[path];
    }
  }

  return result;
}

function getPageEntriesToTranslate(content: Content): TranslatableEntry[] {
  if (content.page) {
    return getFieldsToTranslateFromComponent(content.page);
  }

  if (content.fragment) {
    return getFieldsToTranslateFromComponent(content.fragment);
  }

  return [];
}

function getComponent(key: string, type: ComponentDescriptorType): ComponentDescriptor {
  return runAsAdmin(() => schemaLib.getComponent({ key, type }) as ComponentDescriptor);
}

function getRegionFieldsToTranslate(
  region: Region<(FragmentComponent | LayoutComponent | PartComponent | TextComponent)[]>,
): TranslatableEntry[] {
  const result: TranslatableEntry[] = [];

  region.components.forEach((component) => {
    result.push(...getFieldsToTranslateFromComponent(component));
  });

  return result;
}

function getFieldsToTranslateFromComponent(
  component: PageComponent | FragmentComponent | LayoutComponent | PartComponent | TextComponent,
): TranslatableEntry[] {
  if (isPageComponent(component)) {
    return getFieldsToTranslateFromRegionsBasedComponent(component);
  }

  if (isTextComponent(component)) {
    return makeTextComponentEntry(component);
  }

  if (isPartComponent(component)) {
    return getDescriptorBasedComponentConfigFields(component, 'PART');
  }

  if (isLayoutComponent(component)) {
    return getFieldsToTranslateFromRegionsBasedComponent(component);
  }

  return [];
}

function makeTextComponentEntry(component: TextComponent): TranslatableEntry[] {
  return [
    {
      path: { kind: 'componentText', component: component.path },
      entry: {
        value: component.text,
        type: 'html',
        schemaType: 'HtmlArea',
        schemaLabel: '',
      },
    },
  ];
}

function getDescriptorBasedComponentConfigFields(
  component: PartComponent | LayoutComponent | PageComponent,
  type: 'PART' | 'LAYOUT' | 'PAGE',
): TranslatableEntry[] {
  if (!component.descriptor) {
    return [];
  }

  const descriptor = getComponent(component.descriptor, type);
  const config = component.config as Record<string, Property>;
  const flatConfig = flattenData(config);

  const fields = getTranslatableFields(flatConfig, descriptor.form);
  const result: TranslatableEntry[] = [];

  for (const path in fields) {
    result.push({
      path: makeConfigFieldPath(component, path),
      entry: fields[path],
    });
  }

  return result;
}

// When the component is the page component itself the config belongs to the
// page; otherwise it belongs to the addressed part/layout component.
export function makeConfigFieldPath(
  component: PartComponent | LayoutComponent | PageComponent,
  path: string,
): AiFieldPath {
  const field = toFieldName(path);

  if (isPageComponent(component)) {
    return { kind: 'pageConfig', field };
  }

  return { kind: 'componentConfig', component: component.path || '', field };
}

function getFieldsToTranslateFromRegionsBasedComponent(
  component: PageComponent | LayoutComponent,
): TranslatableEntry[] {
  const result: TranslatableEntry[] = getDescriptorBasedComponentConfigFields(
    component,
    isPageComponent(component) ? 'PAGE' : 'LAYOUT',
  );

  for (const regionName in component.regions) {
    result.push(...getRegionFieldsToTranslate(component.regions[regionName]));
  }

  return result;
}
