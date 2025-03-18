import {useStore} from '@nanostores/react';
import React from 'react';
import {Trans} from 'react-i18next';

import {$data} from '../../../../stores/data';
import FramedText from '../../../shared/FramedText/FramedText';
import AssistantMessage from '../../AssistantMessage/AssistantMessage';
import InstructionsInput from '../../InstructionsInput/InstructionsInput';

export default function PreparationView(): React.ReactNode {
    const {language} = useStore($data, {keys: ['language']});

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
