import type { Message } from '../../shared/types/model';
import type { TextType } from '../../shared/types/text';
import type { DataEntry } from '../content/data';
import type { ModelProxy } from '../proxy/model';
import type { TranslateFieldPayload } from './results';

import { toKey } from '../../shared/ai-field-path';
import { ERRORS } from '../../shared/errors';
import { createTranslationPrompt } from '../../shared/prompts';
import { logError } from '../logger';
import { connect } from '../proxy/proxy';
import { putOutcome } from './results';

export type TranslateContentParams = {
  language: string;
  entry: DataEntry;
  instructions?: string | undefined;
};

export function runTranslateField(payload: TranslateFieldPayload): void {
  const { sessionId, path, entry, targetLanguage, customInstructions } = payload;
  const key = toKey(path);

  try {
    const [text, err] = translate({
      entry,
      language: targetLanguage,
      instructions: customInstructions,
    });

    if (err != null || text == null) {
      const failure = err ?? ERRORS.FUNC_TRANSLATION_EMPTY;
      putOutcome(sessionId, key, {
        status: 'failed',
        path,
        code: failure.code,
        message: failure.message,
      });
    } else {
      putOutcome(sessionId, key, { status: 'completed', path, text });
    }
  } catch (e) {
    logError(`runTranslateField threw for path=${key}:`);
    logError(e);
    putOutcome(sessionId, key, {
      status: 'failed',
      path,
      code: ERRORS.UNKNOWN_ERROR.code,
      message: 'Translation task execution failed',
    });
  }
}

export function translate(item: TranslateContentParams): Try<string> {
  const [model, err] = connectModel(createMessage(item.entry, item.language), item.instructions);

  if (err) {
    logError(`translate: connectModel failed code=${err.code}, message=${err.message}`);
    return [null, err];
  }

  const [response, error] = model.generate();

  if (error) {
    logError(`translate: model.generate failed code=${error.code}, message=${error.message}`);
    return [null, error];
  }

  const text = cleanContent(response.content, item.entry.type);

  if (text == null || (text === '' && item.entry.value !== '')) {
    return [null, ERRORS.FUNC_TRANSLATION_EMPTY];
  }

  return [text, null];
}

function connectModel(messages: Message[], instructions?: string): Try<ModelProxy> {
  return connect({ instructions, messages });
}

function createMessage(entry: DataEntry, language: string): Message[] {
  const text = String(entry.value);
  const prompt = createTranslationPrompt({
    text,
    language,
    type: entry.type,
    context: entry.schemaLabel,
  });

  return [{ role: 'user', text: prompt }];
}

function cleanContent(content: Optional<string>, type: TextType): string | null {
  if (content == null) {
    return null;
  }

  return (type === 'html' ? cleanBackticks(content) : content).trim();
}

function cleanBackticks(input: string): string {
  return input.replace(/^```(?:\w+)?\s*|^`+|`+$|```$/g, '');
}
