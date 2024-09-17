import type {Message, ModelResponseGenerateData} from '../../types/shared/model';

export type ModelProxy = {
    generate(): Try<ModelResponseGenerateData>;
};

export type ModelProxyConfig = {
    model: string;
    instructions?: string;
    messages: Message[];
};
