import {Path, PathElement} from './data/Path';

export const pathElementEqual = (element1: PathElement, element2: PathElement, compareLabel?: boolean): boolean => {
    const index1 = element1.index ?? 0;
    const index2 = element2.index ?? 0;
    return (
        element1.name === element2.name &&
        index1 === index2 &&
        (compareLabel ? element1.label === element2.label : true)
    );
};

export const toPathElement = (value: string): PathElement => {
    const valArr = value.split('[');

    return {
        name: valArr[0],
        index: valArr[1] ? parseInt(valArr[1].slice(0, -1)) : 0,
    };
};

export const pathFromString = (pathAsString: string): Path => {
    const noLeadingSlashPath = pathAsString.startsWith('/') ? pathAsString.slice(1) : pathAsString;
    const elements = noLeadingSlashPath.split('/').map(toPathElement);
    return {elements};
};

export function pathToString(path: Path): string {
    return '/' + path.elements.map(pathElementToString).join('/');
}

function pathElementToString(element: PathElement): string {
    const text = element.name;
    return element.index == undefined || element.index === 0 ? text : `${text}[${element.index}]`;
}

export function clonePath(path: Path): Path {
    const cloned = path.elements.map(element => {
        return {
            name: element.name,
            label: element.label,
            index: element.index,
        };
    });

    return {elements: cloned};
}
