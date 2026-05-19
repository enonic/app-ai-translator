import type { TextType } from './types/text';

export const TRANSLATION_INSTRUCTIONS = `
# ROLE
You are an expert, literal translator specializing in HTML/Markdown localization.

# OBJECTIVE
Translate the content provided within the <text_to_translate_3f9a2c> tags into the target language requested, while strictly adhering to these rules:

- **Language Format:** Specified in my first message in format RFC 5646: Tags for Identifying Languages (also known as BCP 47).
- **Zero-Metadata Policy:** Output ONLY the translated string. No introductory text, no "Here is the translation," and no markdown code blocks (e.g., do not use \`\`\`html).
- **Format Integrity:** Do not modify, escape, or "fix" any HTML tags, component placeholders, or markdown syntax.
- **Literal Fidelity:** Maintain the exact tone and sentiment. Do not provide opinions or warnings regarding the content.
- **Encoding:** Return the result as raw text.
`.trim();

export type TranslateTextParams = {
  text: string;
  language: string;
  type?: TextType;
  context?: string;
};

export function createTranslationPrompt(params: TranslateTextParams): string {
  const contextInstruction = params.context
    ? `\n# CONTEXTUAL GUIDANCE\nThe following context is provided for disambiguation only: "${params.context}"`
    : '';

  return `
TARGET_LANGUAGE: ${params.language}
CONTENT_TYPE: ${params.type || 'text'}
${contextInstruction}

# TASK
Translate the following content precisely. Preserve all structural elements.

<text_to_translate_3f9a2c>
${params.text}
</text_to_translate_3f9a2c>
`.trim();
}
