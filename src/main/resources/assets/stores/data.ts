import {computed, map} from 'nanostores';

import {addGlobalUpdateDataHandler} from '../common/events';
import {ContentData, PropertyArray, PropertyValue} from './data/ContentData';
import {EventData} from './data/EventData';
import {FormItemSetWithPath, FormItemWithPath, FormOptionSetWithPath, InputWithPath} from './data/FormItemWithPath';
import {Path, PathElement} from './data/Path';
import {FormItemSet, FormOptionSet, Schema} from './data/Schema';
import {clonePath, pathFromString, pathToString} from './pathUtil';
import {getFormItemsWithPaths, isFormItemSet, isFormOptionSet, isInput, isInputWithPath} from './schemaUtil';

export type Data = {
    persisted: Optional<ContentData>;
    schema: Optional<Schema>;
};

const store = map<Data>({
    persisted: null,
    schema: null,
});

export interface DataEntry {
    value: string | boolean | number;
    type: 'text' | 'html';
    schemaType: string;
    schemaLabel: string;
    schemaHelpText?: string;
}

addGlobalUpdateDataHandler((event: CustomEvent<EventData>) => {
    putEventDataToStore(event.detail);
});

export default store;

export const getPersistedData = (): Optional<Readonly<ContentData>> => store.get().persisted;

export const setPersistedData = (data: ContentData): void => store.setKey('persisted', data);

export const getSchema = (): Optional<Readonly<Schema>> => store.get().schema;

export const setSchema = (schema: Schema): void => store.setKey('schema', schema);

function putEventDataToStore(eventData: EventData): void {
    const {schema, data} = eventData.payload;
    if (schema) {
        setSchema(schema);
    }
    if (data) {
        setPersistedData(data);
    }
}

export const allFormItemsWithPaths = computed(store, store => {
    void store.persisted;
    const schemaPaths: FormItemWithPath[] = makePathsToFormItems();

    const data = getPersistedData();
    return data ? getDataPathsToEditableItems(schemaPaths, data) : [];
});

function makePathsToFormItems(): FormItemWithPath[] {
    const schema = getSchema();
    return schema ? getFormItemsWithPaths(schema.form.formItems) : [];
}

function getDataPathsToEditableItems(schemaPaths: FormItemWithPath[], data: ContentData): FormItemWithPath[] {
    return schemaPaths.flatMap((schemaPath: FormItemWithPath) => {
        const dataPaths = makePropertyPaths(data.fields, clonePath(schemaPath), []).filter(
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

export const getLanguage = (): string => getPersistedData()?.language ?? navigator?.language ?? 'en';

export function getPathType(path: InputWithPath | undefined): 'html' | 'text' {
    return path?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}

function createDataEntry(path: InputWithPath): DataEntry {
    return {
        value: getValueByPath(path)?.v ?? '',
        type: getPathType(path),
        schemaType: path.Input.inputType,
        schemaLabel: path.Input.label,
    };
}

export function generateAllPathsEntries(): Record<string, DataEntry> {
    const entries: Record<string, DataEntry> = {};

    const inputs = allFormItemsWithPaths.get().filter(isInputWithPath);
    inputs.forEach(path => {
        entries[pathToString(path)] = createDataEntry(path);
    });

    return entries;
}
