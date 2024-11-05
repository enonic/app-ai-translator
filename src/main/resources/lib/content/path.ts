export type Path = {
    elements: PathElement[];
};

export type PathElement = {
    name: string;
    label?: string;
    index?: number;
};

export function pathToString(path: Path): string {
    return path.elements.map(pathElementToString).join('.');
}

function pathElementToString(element: PathElement): string {
    const text = element.name;
    return element.index == undefined || element.index === 0 ? text : `${text}[${element.index}]`;
}
