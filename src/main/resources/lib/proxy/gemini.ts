import type {Content, GenerateContentRequest, POSSIBLE_ROLES} from '@google/generative-ai';

import {HarmBlockThreshold, HarmCategory} from '../../shared/enums';
import {ERRORS} from '../../shared/errors';
import {TRANSLATION_INSTRUCTIONS} from '../../shared/prompts';
import type {FinishReason, ModelResponseGenerateData} from '../../shared/types/model';
import {generate} from '../google/api/generate';
import {logDebug, LogDebugGroups} from '../logger';
import {ModelProxy, ModelProxyConfig} from './model';

type Role = (typeof POSSIBLE_ROLES)[number];

export class GeminiProxy implements ModelProxy {
    private readonly params: GenerateContentRequest;

    constructor(config: ModelProxyConfig) {
        this.params = GeminiProxy.createRequestParams(config);
    }

    private static createRequestParams(config: ModelProxyConfig): GenerateContentRequest {
        const contents = GeminiProxy.createContents(config);
        const systemInstruction = GeminiProxy.createTextContent('system', TRANSLATION_INSTRUCTIONS);

        return {
            contents,
            generationConfig: {
                candidateCount: 1,
                temperature: 0.2,
                topP: 0.9,
                responseMimeType: 'text/plain',
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
            systemInstruction,
        };
    }

    private static createContents(config: ModelProxyConfig): Content[] {
        const {instructions, messages} = config;
        const contents: Content[] = [];

        if (instructions) {
            contents.push(this.createTextContent('user', instructions));
        }

        messages.forEach(({role, text}) => {
            contents.push(this.createTextContent(role, text));
        });

        return contents;
    }

    private static createTextContent(role: Role, text: string): Content {
        return {
            role,
            parts: [{text}],
        };
    }

    private static extractText(content: Content | undefined): string {
        return content?.parts.map(({text}) => text).join('') ?? '';
    }

    generate(): Try<ModelResponseGenerateData> {
        logDebug(LogDebugGroups.FUNC, 'gemini.GeminiProxy.generate()');

        const [response, err] = generate(this.params);
        if (err) {
            return [null, err];
        }

        const {candidates, promptFeedback} = response;

        const [content] = candidates ?? [];
        if (!content) {
            return [null, ERRORS.GOOGLE_CANDIDATES_EMPTY];
        }

        const finishReason: FinishReason = content.finishReason || promptFeedback?.blockReason;

        switch (finishReason) {
            case 'SAFETY':
                return [null, ERRORS.MODEL_SAFETY];
            case 'PROHIBITED_CONTENT':
                return [null, ERRORS.MODEL_PROHIBITED_CONTENT];
            case 'SPII':
                return [null, ERRORS.MODEL_SPII];
        }

        const data: ModelResponseGenerateData = {
            content: GeminiProxy.extractText(content.content),
            finishReason,
        };

        return [data, null];
    }
}
