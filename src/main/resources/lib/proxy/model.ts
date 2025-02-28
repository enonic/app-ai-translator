import type {Message, ModelResponseGenerateData} from '../../shared/types/model';

export type ModelProxy = {
    generate(): Try<ModelResponseGenerateData>;
};

export type ModelProxyConfig = {
    instructions?: string;
    messages: Message[];
};
