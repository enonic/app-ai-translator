import {computed, map} from 'nanostores';

import {requestTranslation} from '../requests/translation';
import {TranslationParams} from './data/RequestData';
import {RequestState} from './data/RequestState';

type StoredRunningRequest<T> = {
    request: Promise<Err<T>>;
    state: RequestState.IN_PROGRESS;
};

type StoredCompletedRequest = {
    state: Exclude<RequestState, RequestState.IN_PROGRESS>;
};

type StoredRequest<T> = StoredRunningRequest<T> | StoredCompletedRequest;

export interface RequestStore {
    translate: StoredRequest<boolean>;
}

export const $requests = map<RequestStore>({
    translate: {state: RequestState.DONE},
});

export const $translating = computed($requests, ({translate}) => translate.state === RequestState.IN_PROGRESS);

export async function postTranslate(params: TranslationParams): Promise<void> {
    await requestTranslation(params);
}
