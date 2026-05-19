import type {
  AiContentSnapshot,
  AiLanguageSnapshot,
  AiSchemaSnapshot,
} from '@shared/ai-protocol';

export type Language = AiLanguageSnapshot;

export type ContentData = AiContentSnapshot;

export type Schema = AiSchemaSnapshot;

export type Content = {
  language: Language;
  persisted: Optional<ContentData>;
  schema: Optional<Schema>;
};
