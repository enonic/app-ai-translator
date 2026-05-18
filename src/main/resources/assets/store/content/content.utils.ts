import type { ContentData, Language, Schema } from './content.types';

import { $content } from './content.store';

export const getContentId = (): string => $content.get().persisted?.contentId ?? '';

export const getProject = (): string => $content.get().persisted?.project ?? '';

export const getLanguage = (): Readonly<Language> => $content.get().language;

export const setLanguage = (language: Language): void => $content.setKey('language', language);

export const setPersistedData = (data: ContentData): void => $content.setKey('persisted', data);

export const setSchema = (schema: Schema): void => $content.setKey('schema', schema);
