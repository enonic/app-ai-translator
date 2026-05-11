import { map } from 'nanostores';

import { addGlobalUpdateDataHandler } from '@/common/events';

import type { ContentData } from './ContentData';
import type { EventData } from './EventData';
import type { Language } from './Language';
import type { Schema } from './Schema';

export type Content = {
  language: Language;
  persisted: Optional<ContentData>;
  schema: Optional<Schema>;
};

export const $content = map<Content>({
  language: {
    tag: navigator?.language ?? 'en',
    name: 'English',
  },
  persisted: null,
  schema: null,
});

addGlobalUpdateDataHandler((event: CustomEvent<EventData>) => {
  putEventDataToStore(event.detail);
});

export const getContentId = (): string => $content.get().persisted?.contentId ?? '';

export const getProject = (): string => $content.get().persisted?.project ?? '';

export const getLanguage = (): Readonly<Language> => $content.get().language;

export const setLanguage = (language: Language): void => $content.setKey('language', language);

export const setPersistedData = (data: ContentData): void => $content.setKey('persisted', data);

export const setSchema = (schema: Schema): void => $content.setKey('schema', schema);

function putEventDataToStore(eventData: EventData): void {
  const { language, data, schema } = eventData.payload;

  if (language) {
    setLanguage(language);
  }

  if (data) {
    setPersistedData(data);
  }

  if (schema) {
    setSchema(schema);
  }
}
