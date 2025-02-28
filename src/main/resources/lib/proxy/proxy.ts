import {logDebug, LogDebugGroups} from '../logger';
import {GeminiProxy} from './gemini';
import {ModelProxy, ModelProxyConfig} from './model';

type ConnectionConfig = Omit<ModelProxyConfig, 'model'>;

export function connect({instructions, messages}: ConnectionConfig): Try<ModelProxy> {
    logDebug(
        LogDebugGroups.FUNC,
        `proxy.connect([instructions: ${instructions?.length ?? 0}], [messages: ${messages.length}]})`,
    );

    const config = {instructions, messages};
    return [new GeminiProxy(config), null];
}
