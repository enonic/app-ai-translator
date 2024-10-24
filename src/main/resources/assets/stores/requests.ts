import {computed, map} from 'nanostores';

import {dispatchCompleted, dispatchStarted} from '../common/events';
import {requestTranslation} from '../requests/translation';
import {generateAllPathsEntries} from './data';
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

async function attachRequest<T, K extends keyof RequestStore>(key: K, request: Promise<T>): Promise<Err<T>> {
    try {
        const data = await request;
        $requests.setKey(key, {state: RequestState.DONE});
        return [data, null];
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        $requests.setKey(key, {state: RequestState.ERROR});
        console.error(`[Enonic AI] Failed to complete request "${key}". Reason: ${msg}`);
        return [null, Error(msg)];
    }
}

export async function postTranslate(language: string, instructions?: string): Promise<boolean> {
    const entries = generateAllPathsEntries();
    const translations = Object.entries(entries).map(async ([path, entry]): Promise<void> => {
        if (entry.value) {
            dispatchStarted({path});
            const value = await requestTranslation(entry, language, instructions);
            dispatchCompleted({path, value});
        }
    });

    const request = attachRequest(
        'translate',
        Promise.all(translations).then(() => true),
    );

    $requests.setKey('translate', {state: RequestState.IN_PROGRESS, request});

    const [success] = await request;

    return success ?? false;
}
