import {getValueByPath, getValueByStringPath, setPersistedData, setValueByPath} from './data';
import {ContentData, PropertyValue} from './data/ContentData';
import {Path} from './data/Path';

describe('getValueByPath', () => {
    it('should return first item when no index defined', () => {
        setPersistedData(getRootTextItems());

        const parentPath: Path = {
            elements: [{name: 'myTextArea'}],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'v1'};

        expect(received).toEqual(expected);
    });

    it('should return right item when index specified', () => {
        setPersistedData(getRootTextItems());

        const parentPath: Path = {
            elements: [{name: 'myTextArea', index: 1}],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value', () => {
        setPersistedData(getFieldSetData());

        const parentPath: Path = {
            elements: [{name: 'contact_info'}, {name: 'phone_number'}],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 00'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value with indexes specified', () => {
        setPersistedData(getFieldSetData());

        const parentPath: Path = {
            elements: [
                {name: 'contact_info', index: 0},
                {name: 'phone_number', index: 1},
            ],
        };

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 01'};

        expect(received).toEqual(expected);
    });
});

describe('getValueByStringPath', () => {
    it('should return first item when no index defined', () => {
        setPersistedData(getRootTextItems());

        const parentPath = 'myTextArea';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'v1'};

        expect(received).toEqual(expected);
    });

    it('should return right item when index specified', () => {
        setPersistedData(getRootTextItems());

        const parentPath = 'myTextArea[1]';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return right item with trailing slash', () => {
        setPersistedData(getRootTextItems());

        const parentPath = '/myTextArea[1]';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'v2'};

        expect(received).toEqual(expected);
    });

    it('should return nested property value', () => {
        setPersistedData(getFieldSetData());

        const parentPath = 'contact_info[1]/phone_number[1]';
        const received = getValueByStringPath(parentPath);
        const expected: PropertyValue = {v: 'phone number 11'};

        expect(received).toEqual(expected);
    });
});

describe('setValueByPath', () => {
    it('should set value', () => {
        const data = getRootTextItems();

        const parentPath: Path = {
            elements: [{name: 'myTextArea'}],
        };

        setValueByPath({v: 'newValue'}, parentPath, data);
        setPersistedData(data);

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'newValue'};

        expect(received).toEqual(expected);
    });

    it('should set value in nested item', () => {
        const data = getFieldSetData();

        const parentPath: Path = {
            elements: [
                {name: 'contact_info', index: 1},
                {name: 'phone_number', index: 1},
            ],
        };

        setValueByPath({v: 'newValue'}, parentPath, data);
        setPersistedData(data);

        const received = getValueByPath(parentPath);
        const expected: PropertyValue = {v: 'newValue'};

        expect(received).toEqual(expected);
    });
});

function getRootTextItems(): ContentData {
    return {
        fields: [
            {
                name: 'myTextArea',
                type: 'String',
                values: [{v: 'v1'}, {v: 'v2'}],
            },
            {
                name: 'myTextLine',
                type: 'String',
                values: [{v: null}],
            },
        ],
        topic: 'all input types',
        language: 'ak',
    };
}

function getFieldSetData(): ContentData {
    return {
        fields: [
            {
                name: 'contact_info',
                type: 'PropertySet',
                values: [
                    {
                        set: [
                            {
                                name: 'label',
                                type: 'String',
                                values: [{v: 'label'}],
                            },
                            {
                                name: 'phone_number',
                                type: 'String',
                                values: [{v: 'phone number 00'}, {v: 'phone number 01'}],
                            },
                        ],
                    },
                    {
                        set: [
                            {
                                name: 'label',
                                type: 'String',
                                values: [{v: 'c'}],
                            },
                            {
                                name: 'phone_number',
                                type: 'String',
                                values: [{v: 'phone number 10'}, {v: 'phone number 11'}],
                            },
                        ],
                    },
                ],
            },
        ],
        topic: 'all input types',
        language: 'ak',
    };
}
