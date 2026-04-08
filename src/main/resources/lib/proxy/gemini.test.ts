import {content} from '../../../../../tests/testUtils/fixtures/google';
import {TRANSLATION_INSTRUCTIONS} from '../../shared/prompts';
import {generate} from '../google/api/generate';
import {GeminiProxy} from './gemini';

type GoogleApi = typeof import('../google/api/generate');

type MockedGenerate = jest.MockedFunction<typeof generate>;

type MockedGoogleApi = GoogleApi & {
    generate: MockedGenerate;
};

jest.mock('../google/api/generate', () => {
    const originalModule = jest.requireActual<GoogleApi>('../google/api/generate');
    return {
        ...originalModule,
        generate: jest.fn(),
    } satisfies MockedGoogleApi;
});

let mocks: MockedGoogleApi;

beforeAll(() => {
    mocks = jest.requireMock<MockedGoogleApi>('../google/api/generate');
});

describe('GeminiProxy', () => {
    it('should disable thinking in the model generation config', () => {
        mocks.generate.mockImplementationOnce(() => [content, null]);

        const proxy = new GeminiProxy({
            instructions: 'Prefer glossary-approved terms.',
            messages: [{role: 'user', text: 'Translate this content.'}],
        });

        const [result, err] = proxy.generate();

        expect(result).toEqual({
            content:
                'The backpack, heavier than it looked, hummed with the weight of a thousand untold stories, each zipper pull a potential portal to another world. \n',
            finishReason: 'STOP',
        });
        expect(err).toBeNull();

        expect(mocks.generate).toHaveBeenCalledWith({
            contents: [
                {
                    role: 'user',
                    parts: [{text: 'Prefer glossary-approved terms.'}],
                },
                {
                    role: 'user',
                    parts: [{text: 'Translate this content.'}],
                },
            ],
            generationConfig: {
                candidateCount: 1,
                temperature: 0.2,
                topP: 0.9,
                responseMimeType: 'text/plain',
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_NONE',
                },
            ],
            systemInstruction: {
                role: 'system',
                parts: [{text: TRANSLATION_INSTRUCTIONS}],
            },
        });
    });
});
