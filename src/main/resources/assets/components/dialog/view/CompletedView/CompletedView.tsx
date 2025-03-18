import React from 'react';

import AssistantMessage from '../../AssistantMessage/AssistantMessage';
import TranslationResult from '../TranslationResult/TranslationResult';

export default function CompletedView(): React.ReactNode {
    return (
        <AssistantMessage>
            <p className='inline-block mr-auto px-3 py-2 text-sm rounded-[1.5rem] bg-enonic-gray-100'>
                <TranslationResult />
            </p>
        </AssistantMessage>
    );
}
