import {computed, map} from 'nanostores';

import {addGlobalUpdateDataHandler} from '../common/events';
import {ContentData, PropertyArray, PropertyValue} from './data/ContentData';
import {EventData} from './data/EventData';
import {FormItemSetWithPath, FormItemWithPath, FormOptionSetWithPath, InputWithPath} from './data/FormItemWithPath';
import {Language} from './data/Language';
import {Path, PathElement} from './data/Path';
import {FormItemSet, FormOptionSet, Schema} from './data/Schema';
import {XData} from './data/XData';
import {clonePath, pathFromString, pathToString} from './pathUtil';
import {getFormItemsWithPaths, isFormItemSet, isFormOptionSet, isInput, isInputWithPath} from './schemaUtil';

export type Data = {
    language: Language;
    persisted: Optional<ContentData>;
    schema: Optional<Schema>;
    xData: Optional<XData[]>;
    xDataSchemas: Optional<Schema[]>;
};

export type DataEntryValue = string | boolean | number;

export const $data = map<Data>({
    language: {
        tag: navigator?.language ?? 'en',
        name: 'English',
    },
    persisted: null,
    schema: null,
    xData: null,
    xDataSchemas: null,
});

export interface DataEntry {
    value: DataEntryValue;
    type: 'text' | 'html';
    schemaType: string;
    schemaLabel: string;
    schemaHelpText?: string;
}

addGlobalUpdateDataHandler((event: CustomEvent<EventData>) => {
    putEventDataToStore(event.detail);
});

export const getLanguage = (): Readonly<Language> => $data.get().language;

export const setLanguage = (language: Language): void => $data.setKey('language', language);

export const getPersistedData = (): Optional<Readonly<ContentData>> => $data.get().persisted;

export const setPersistedData = (data: ContentData): void => $data.setKey('persisted', data);

export const getSchema = (): Optional<Readonly<Schema>> => $data.get().schema;

export const setSchema = (schema: Schema): void => $data.setKey('schema', schema);

export const setXData = (xData: XData[]): void => $data.setKey('xData', xData ?? []);

export const getXData = (): Optional<Readonly<XData[]>> => $data.get().xData;

export const setXDataSchemas = (xDataSchemas: Schema[]): void => $data.setKey('xDataSchemas', xDataSchemas ?? []);

export const getXDataSchemas = (): Optional<Readonly<Schema[]>> => $data.get().xDataSchemas;

function putEventDataToStore(eventData: EventData): void {
    const {language, data, schema, xData, xDataSchemas} = eventData.payload;

    if (language) {
        setLanguage(language);
    }

    if (data) {
        setPersistedData(data);
    }

    if (schema) {
        setSchema(schema);
    }

    if (xData) {
        setXData(xData);
    }

    if (xDataSchemas) {
        setXDataSchemas(xDataSchemas);
    }
}

export const $allFormItemsWithPaths = computed($data, store => {
    void store.persisted;

    const data = getPersistedData();

    if (!data) {
        return [];
    }

    return getDataPathsToEditableItems(makePathsToFormItems(), data.fields);
});

export const $allXDataFormItemsWithPaths = computed($data, store => {
    void store.xData;

    const allXData = getXData();

    if (!allXData) {
        return {};
    }

    const xDataFormItemsWithPaths: Record<string, FormItemWithPath[]> = {};

    allXData.forEach(xData => {
        const xDataSchema = getXDataSchemas()?.find(schema => schema.name === xData.name);

        if (xDataSchema) {
            const schemaPaths: FormItemWithPath[] = getFormItemsWithPaths(xDataSchema.form.formItems);
            xDataFormItemsWithPaths[xData.name] = getDataPathsToEditableItems(schemaPaths, xData.fields);
        }
    });

    return xDataFormItemsWithPaths;
});

export const $hasData = computed([$allFormItemsWithPaths, $allXDataFormItemsWithPaths], (store, xDataStore) => {
    return [...store, ...Object.values(xDataStore).flat()].some(
        path => isInputWithPath(path) && !!getValueByPath(path)?.v,
    );
});

function makePathsToFormItems(): FormItemWithPath[] {
    const schema = getSchema();
    return schema ? getFormItemsWithPaths(schema.form.formItems) : [];
}

function getDataPathsToEditableItems(schemaPaths: FormItemWithPath[], fields: PropertyArray[]): FormItemWithPath[] {
    return schemaPaths.flatMap((schemaPath: FormItemWithPath) => {
        const dataPaths = makePropertyPaths(fields, clonePath(schemaPath), []).filter(
            dataPath => dataPath.elements.length === schemaPath.elements.length,
        );

        return dataPaths.map(dataPath => {
            if (isInput(schemaPath)) {
                return {
                    ...dataPath,
                    Input: schemaPath.Input,
                } as InputWithPath;
            }

            if (isFormItemSet(schemaPath)) {
                return {
                    ...dataPath,
                    FormItemSet: (schemaPath as FormItemSet).FormItemSet,
                } as FormItemSetWithPath;
            }

            if (isFormOptionSet(schemaPath)) {
                return {
                    ...dataPath,
                    FormOptionSet: (schemaPath as FormOptionSet).FormOptionSet,
                } as FormOptionSetWithPath;
            }

            return {
                // FormOptionSetOption, take all props, then overwrite with correct path (path with correct index)
                ...schemaPath,
                ...dataPath,
            };
        });
    });
}

function makePropertyPaths(
    properties: PropertyArray[] | undefined,
    schemaPath: Path,
    previousIterationResult: Path[],
): Path[] {
    const pathElement = schemaPath.elements.shift();

    if (!pathElement || !properties) {
        return previousIterationResult;
    }

    const propertyArray = properties.find(propertyArray => propertyArray.name === pathElement.name);

    if (!propertyArray || propertyArray.values.length === 0) {
        return previousIterationResult;
    }

    const thisIterationResult: Path[] = [];

    propertyArray.values.forEach((value: PropertyValue, index) => {
        const newPathElement: PathElement = {
            name: propertyArray.name,
            label: pathElement.label,
            index: index,
        };

        const newPath = previousIterationResult.length > 0 ? clonePath(previousIterationResult[0]) : {elements: []};
        newPath.elements.push(newPathElement);

        thisIterationResult.push(...makePropertyPaths(value.set, clonePath(schemaPath), [newPath]));
    });

    return thisIterationResult;
}

export function getValueByStringPath(pathAsString: string): Optional<PropertyValue> {
    const path = pathFromString(pathAsString);
    return path ? getValueByPath(path) : null;
}

export function getValueByPath(path: Path): Optional<PropertyValue> {
    const array = getPropertyArrayByPath(path);

    if (array) {
        const index = path.elements[path.elements.length - 1]?.index ?? 0;
        return array.values[index];
    }

    return null;
}

function getPropertyArrayByPath(
    path: Path,
    data = structuredClone(getPersistedData()),
): Optional<Readonly<PropertyArray>> {
    return data ? doGetPropertyArrayByPath(data.fields, path) : undefined;
}

function doGetPropertyArrayByPath(properties: PropertyArray[], path: Path): Optional<PropertyArray> {
    const pathElements = path.elements.slice();
    const pathElement = pathElements.shift();

    if (!pathElement) {
        return;
    }

    const propertyArray = properties.find(propertyArray => propertyArray.name === pathElement.name);

    if (!propertyArray || pathElements.length === 0) {
        return propertyArray;
    }

    const index = pathElement.index ?? 0;
    const value = propertyArray.values[index];

    if (!value || !value.set) {
        return;
    }

    return doGetPropertyArrayByPath(value.set, {elements: pathElements});
}

export function getPathType(path: InputWithPath | undefined): 'html' | 'text' {
    return path?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}

function createDataEntry(value: DataEntryValue, path: InputWithPath): DataEntry {
    return {
        value: value,
        type: getPathType(path),
        schemaType: path.Input.inputType,
        schemaLabel: path.Input.label,
    };
}

export function generateAllDataPathsEntries(): Record<string, DataEntry> {
    const entries: Record<string, DataEntry> = {};

    const inputs = $allFormItemsWithPaths.get().filter(isInputWithPath);
    inputs.forEach(path => {
        entries[pathToString(path)] = createDataEntry(getValueByPath(path)?.v ?? '', path);
    });

    return entries;
}

export function generateAllXDataPathsEntries(): Record<string, Record<string, DataEntry>> {
    const xDataEntries: Record<string, Record<string, DataEntry>> = {};

    Object.entries($allXDataFormItemsWithPaths.get()).forEach(([xDataName, xDataPaths]) => {
        xDataEntries[xDataName] = generateXDataPathsEntries(xDataName, xDataPaths);
    });

    return xDataEntries;
}

function generateXDataPathsEntries(
    xDataName: string,
    formItemsWithPath: FormItemWithPath[],
): Record<string, DataEntry> {
    const entries: Record<string, DataEntry> = {};

    const inputs = formItemsWithPath.filter(isInputWithPath);
    inputs.forEach(path => {
        entries[pathToString(path)] = createDataEntry(getXDataValueByPath(xDataName, path)?.v ?? '', path);
    });

    return entries;
}

export function getXDataValueByPath(xDataName: string, path: Path): Optional<PropertyValue> {
    const xData = getXData()?.find(xData => xData.name === xDataName);

    if (!xData) {
        return null;
    }

    const array = doGetPropertyArrayByPath(xData.fields, path);

    if (array) {
        const index = path.elements[path.elements.length - 1]?.index ?? 0;
        return array.values[index];
    }

    return null;
}
