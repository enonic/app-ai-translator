import {useStore} from '@nanostores/react';
import React from 'react';
import {Trans} from 'react-i18next';

import {$items} from '../../../stores/items';
import FramedText from '../../shared/FramedText/FramedText';
import AssistantMessage from '../AssistantMessage/AssistantMessage';

export default function CompletedView(): React.ReactNode {
    const {failed} = useStore($items);
    const failedCount = failed.length;

    return (
        <AssistantMessage>
            <p className='inline-block mr-auto px-3 py-2 text-sm rounded-[1.5rem] bg-enonic-gray-100'>
                <Trans
                    i18nKey={failedCount > 0 ? 'text.result.failed' : 'text.result.completed'}
                    components={failedCount > 0 ? [<FramedText key='failed-count'>{failedCount}</FramedText>] : []}
                />
            </p>
        </AssistantMessage>
    );
}
