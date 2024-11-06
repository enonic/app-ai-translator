import {map} from 'nanostores';

import {addGlobalUpdateDataHandler} from '../common/events';
import {ContentData} from './data/ContentData';
import {EventData} from './data/EventData';
import {Language} from './data/Language';
import {Schema} from './data/Schema';

export type Data = {
    language: Language;
    persisted: Optional<ContentData>;
    schema: Optional<Schema>;
};

export const $data = map<Data>({
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

export const getContentId = (): string => $data.get().persisted?.contentId ?? '';

export const getProject = (): string => $data.get().persisted?.project ?? '';

export const getLanguage = (): Readonly<Language> => $data.get().language;

export const setLanguage = (language: Language): void => $data.setKey('language', language);

export const setPersistedData = (data: ContentData): void => $data.setKey('persisted', data);

export const setSchema = (schema: Schema): void => $data.setKey('schema', schema);

function putEventDataToStore(eventData: EventData): void {
    const {language, data, schema} = eventData.payload;

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
