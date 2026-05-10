import type {ContentData} from './ContentData';
import type {Language} from './Language';
import type {Schema} from './Schema';

export type EventData = {
    payload: {
        language?: Language;
        data?: ContentData;
        schema?: Schema;
    };
};
