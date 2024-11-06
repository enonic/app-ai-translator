export function emptyToUndefined<T = unknown>(array: Optional<T[]>): T[] | undefined {
    return array == null || array.length === 0 ? undefined : array;
}

export function isRecordEmpty(record: Record<string, unknown>): boolean {
    return Object.keys(record).length === 0;
}
