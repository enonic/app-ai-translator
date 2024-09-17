export function emptyToUndefined<T = unknown>(array: Optional<T[]>): T[] | undefined {
    return array == null || array.length === 0 ? undefined : array;
}
