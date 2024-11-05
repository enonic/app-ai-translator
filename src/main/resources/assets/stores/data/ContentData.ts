export type ContentData = {
    fields: PropertyArray[];
    topic: string;
    id: string;
    context: string;
};

export type PropertyArray = {
    name: string;
    type: string;
    values: PropertyValue[];
};

export type PropertyValue = {
    v?: string | boolean | number | null;
    set?: PropertyArray[];
};
