import { describe, expect, it, vi } from 'vitest';

import { content } from '../../../../../tests/testUtils/fixtures/google';
import { TRANSLATION_INSTRUCTIONS } from '../../shared/prompts';
import * as GoogleApi from '../google/api/generate';
import { GeminiProxy } from './gemini';

vi.mock('../google/api/generate', async importOriginal => {
    const original = await importOriginal<typeof GoogleApi>();
    return {
        ...original,
        generate: vi.fn(),
    };
});

describe('GeminiProxy', () => {
    it('should disable thinking in the model generation config', () => {
        const mockedGenerate = vi.mocked(GoogleApi.generate);
        mockedGenerate.mockImplementationOnce(() => [content, null]);

        const proxy = new GeminiProxy({
            instructions: 'Prefer glossary-approved terms.',
            messages: [{ role: 'user', text: 'Translate this content.' }],
        });

        const [result, err] = proxy.generate();

        expect(result).toEqual({
            content:
                'The backpack, heavier than it looked, hummed with the weight of a thousand untold stories, each zipper pull a potential portal to another world. \n',
            finishReason: 'STOP',
        });
        expect(err).toBeNull();

        expect(mockedGenerate).toHaveBeenCalledWith({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: 'Prefer glossary-approved terms.' }],
                },
                {
                    role: 'user',
                    parts: [{ text: 'Translate this content.' }],
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
                parts: [{ text: TRANSLATION_INSTRUCTIONS }],
            },
        });
    });
});
