import {ContentData} from './ContentData';
import {Language} from './Language';
import {Schema} from './Schema';
import {XData} from './XData';

export type EventData = {
    payload: {
        language?: Language;
        data?: ContentData;
        schema?: Schema;
        xData?: XData[];
        xDataSchemas?: Schema[];
    };
};
