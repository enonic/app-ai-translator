import {flattenData} from './data';

const dataJson = {
    'level-1': {
        myTextLine: 'Hello',
        'level-2': {
            myTextLine: 'Hello Nested',
            'level-3': {
                myTextLine: 'Nested 3',
                'level-4': {
                    myTextLine: 'Nested 4',
                },
            },
        },
    },
};

const pagePartJson = {
    splashHeaderLibrary: {
        oria: 'default',
        content: '<p>Hello there. This is <em>text area</em>.</p>\n',
        inputLinkSet: {
            title: 'Some title text',
            linkSet: {},
        },
        buttonSet: {
            title: 'Another title text',
            linkSet: {},
            backgroundColor: 'dark',
            size: 'sm',
            hyphen: false,
        },
    },
};

describe('flattenData', () => {
    it('should flatten data json', () => {
        expect(flattenData(dataJson)).toEqual({
            'level-1/myTextLine': 'Hello',
            'level-1/level-2/myTextLine': 'Hello Nested',
            'level-1/level-2/level-3/myTextLine': 'Nested 3',
            'level-1/level-2/level-3/level-4/myTextLine': 'Nested 4',
        });
    });
    it('should flatten page json', () => {
        expect(flattenData(pagePartJson)).toEqual({
            'splashHeaderLibrary/oria': 'default',
            'splashHeaderLibrary/content': '<p>Hello there. This is <em>text area</em>.</p>\n',
            'splashHeaderLibrary/inputLinkSet/title': 'Some title text',
            'splashHeaderLibrary/buttonSet/title': 'Another title text',
            'splashHeaderLibrary/buttonSet/backgroundColor': 'dark',
            'splashHeaderLibrary/buttonSet/size': 'sm',
            'splashHeaderLibrary/buttonSet/hyphen': false,
        });
    });
});
