export function isRecordEmpty(record: Record<string, unknown>): boolean {
    return Object.keys(record).length === 0;
}
