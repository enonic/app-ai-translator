import {useStore} from '@nanostores/react';
import React from 'react';
import {Trans} from 'react-i18next';

import FramedText from '@/ui/primitives/FramedText';
import {$content} from '@/store/content';

import AssistantMessage from '@/components/dialog/AssistantMessage/AssistantMessage';
import InstructionsInput from '@/components/dialog/InstructionsInput/InstructionsInput';

export default function PreparationView(): React.ReactNode {
    const {language} = useStore($content, {keys: ['language']});

    return (
        <>
            <AssistantMessage>
                <p className='inline-block mr-auto px-3 py-2 text-sm rounded-[1.5rem] bg-enonic-gray-100'>
                    <Trans
                        i18nKey='text.greeting'
                        components={[<FramedText key='language'>{language.name}</FramedText>]}
                    />
                </p>
            </AssistantMessage>
            <InstructionsInput />
        </>
    );
}
