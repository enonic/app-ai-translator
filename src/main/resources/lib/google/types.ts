import type {Content, Part, SafetySetting} from '@google/genai';

export type {Content, Part};

export type Role = 'user' | 'model' | 'system';

export type GenerationConfig = {
    candidateCount?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    responseMimeType?: string;
};

export type GenerateContentRequest = {
    contents: Content[];
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    systemInstruction?: Content;
};

export type SafetyRating = {
    category: string;
    probability: string;
    blocked?: boolean;
};

export type Candidate = {
    content: Content;
    finishReason?: string;
    index?: number;
    safetyRatings?: SafetyRating[];
};

export type GenerateContentResponse = {
    candidates?: Candidate[];
    promptFeedback?: {
        blockReason?: string;
        safetyRatings?: SafetyRating[];
    };
    usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
    };
};
