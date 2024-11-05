import {Property, PropertyValue} from './property';

export type DataEntry = {
    value: PropertyValue;
    type: 'text' | 'html';
    schemaType: string;
    schemaLabel: string;
    schemaHelpText?: string;
};

export function flattenData(data: Record<string, Property>): Record<string, PropertyValue> {
    return flattenJson(data);
}

function flattenJson(nestedJson: Record<string, Property>, parentKey = '', sep = '.'): Record<string, PropertyValue> {
    const flattened: Record<string, PropertyValue> = {};

    for (const key in nestedJson) {
        if (Object.prototype.hasOwnProperty.call(nestedJson, key)) {
            const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
            const value = nestedJson[key];

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                overwrite(flattened, flattenJson(value as Record<string, Property>, newKey, sep));
            } else if (Array.isArray(value)) {
                value?.forEach((item, index) => {
                    const arrayKey = `${newKey}[${index}]`;
                    if (typeof item === 'object' && item !== null) {
                        overwrite(flattened, flattenJson(item as Record<string, Property>, arrayKey, sep));
                    } else {
                        flattened[arrayKey] = item;
                    }
                });
            } else {
                flattened[newKey] = value;
            }
        }
    }

    return flattened;
}

function overwrite(target: Record<string, PropertyValue>, source: Record<string, PropertyValue>): void {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
}
