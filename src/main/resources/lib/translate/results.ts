import type { AiFieldPath } from '../../shared/ai-protocol';
import type { DataEntry } from '../content/data';

export type TranslateFieldPayload = {
  sessionId: string;
  path: AiFieldPath;
  entry: DataEntry;
  targetLanguage: string;
  customInstructions?: string;
};

export type FieldOutcome =
  | { status: 'completed'; path: AiFieldPath; text: string }
  | { status: 'failed'; path: AiFieldPath; code: number; message: string };

export function encodeOutcome(outcome: FieldOutcome): string {
  return JSON.stringify(outcome);
}

export function decodeOutcome(json: string): FieldOutcome {
  return JSON.parse(json) as FieldOutcome;
}

function registry(): WsMessages {
  return __.newBean<WsMessages>('com.enonic.app.ai.translator.internal.WsMessages');
}

export function putOutcome(sessionId: string, key: string, outcome: FieldOutcome): void {
  registry().forSession(sessionId).put(key, encodeOutcome(outcome));
}

export function drainOutcomes(sessionId: string, consume: (outcome: FieldOutcome) => void): void {
  const bucket = registry().forSession(sessionId);
  bucket.forEach((key: string, json: string): void => {
    consume(decodeOutcome(json));
    bucket.remove(key);
  });
}

export function clearSession(sessionId: string): void {
  registry().clear(sessionId);
}
