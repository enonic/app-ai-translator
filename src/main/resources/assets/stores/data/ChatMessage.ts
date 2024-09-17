export type ModelChatMessageContent = Record<string, string | MultipleContentValue | undefined>;

export type MultipleContentValue = {
    values: string[];
    selectedIndex: number;
};
