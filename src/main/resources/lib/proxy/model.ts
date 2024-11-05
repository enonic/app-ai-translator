import type {Message, ModelResponseGenerateData} from '../../shared/types/model';

export type ModelProxy = {
    generate(): Try<ModelResponseGenerateData>;
};

export type ModelProxyConfig = {
    model: string;
    instructions?: string;
    messages: Message[];
};
