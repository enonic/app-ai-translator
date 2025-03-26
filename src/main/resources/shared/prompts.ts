import type {TextType} from './types/text';

export const TRANSLATION_INSTRUCTIONS = `
# INSTRUCTIONS

You MUST follow the instructions for answering:

- ALWAYS return ONLY the translated text without any additional explanations or comments.
- Target language is specified in my first message in format RFC 5646: Tags for Identifying Languages (also known as BCP 47).
- Translate only the text that goes after 'The text to translate:'.
- ALWAYS keep the structure and format of the text.
- ALWAYS keep the links and other HTML tags in the text.
- DO NOT JUDGE or give your opinion, only translate.
- Do not alter or remove any formatting elements unless explicitly instructed.
- DO NOT enclose the translated HTML in any markdown code blocks (e.g., \`\`\`html, \`\`\`). Return only the raw HTML.
`.trim();

export type TranslateTextParams = {
    text: string;
    language: string;
    type?: TextType;
    context?: string;
};

export function createTranslationPrompt(params: TranslateTextParams): string {
    return [
        `Detect the language of the provided text and translate it into \`${params.language}\`.`,
        `* The format of the text is \`${params?.type || 'text'}\`, so preserve ALL formatting (e.g., HTML tags, Markdown elements, etc.).`,
        `* The text is used in the context of "${params.context}". Only use this context if it is MEANINGFUL. If it is unclear or irrelevant, ignore it.`,
        'The text to translate:',
        params.text,
    ].join('\n');
}
