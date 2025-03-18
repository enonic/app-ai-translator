import {useStore} from '@nanostores/react';
import React from 'react';

import {$items} from '../../../stores/items';
import AssistantMessage from '../AssistantMessage/AssistantMessage';
import ThinkingMessage, {ThinkingItem} from '../ThinkingMessage/ThinkingMessage';

export default function ProcessingView(): React.ReactNode {
    const {paths, remaining, succeeded, failed} = useStore($items);

    const items = paths.map(path => {
        const status = remaining.includes(path) ? 'pending' : succeeded.includes(path) ? 'succeeded' : 'failed';
        return {
            path,
            status,
            error: failed.find(f => f.path === path)?.reason,
        } satisfies ThinkingItem;
    });

    return (
        <>
            <AssistantMessage>
                <ThinkingMessage items={items} />
            </AssistantMessage>
        </>
    );
}
