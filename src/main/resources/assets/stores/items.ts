import {computed, map} from 'nanostores';

export type FailedItem = {
    path: string;
    reason: string;
};

export type ItemsStore = {
    paths: string[];
    remaining: string[];
    succeeded: string[];
    failed: FailedItem[];
};

export const $items = map<ItemsStore>({
    paths: [],
    remaining: [],
    succeeded: [],
    failed: [],
});

export const $isAllItemsProcessed = computed($items, ({paths, remaining}) => {
    return paths.length > 0 && remaining.length === 0;
});

export function setPaths(paths: string[]): void {
    $items.set({
        paths,
        remaining: paths,
        succeeded: [],
        failed: [],
    });
}

export function resetItems(): void {
    setPaths([]);
}

export function addSucceeded(path: string): void {
    const {succeeded, remaining} = $items.get();
    const newRemaining = remaining.filter(p => p !== path);
    if (newRemaining.length < remaining.length) {
        $items.setKey('succeeded', [...succeeded, path]);
        $items.setKey('remaining', newRemaining);
    }
}

export function addFailed(path: string, reason: string): void {
    const {failed, remaining} = $items.get();
    const newRemaining = remaining.filter(p => p !== path);
    if (newRemaining.length < remaining.length) {
        $items.setKey('failed', [...failed, {path, reason}]);
        $items.setKey('remaining', newRemaining);
    }
}
