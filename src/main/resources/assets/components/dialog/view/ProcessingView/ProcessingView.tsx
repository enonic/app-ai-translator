import {useStore} from '@nanostores/react';
import React from 'react';
import {Trans} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import {$data} from '../../../../stores/data';
import {$items} from '../../../../stores/items';
import FramedText from '../../../shared/FramedText/FramedText';
import AssistantMessage from '../../AssistantMessage/AssistantMessage';

export default function ProcessingView(): React.ReactNode {
    const {paths, remaining} = useStore($items);
    const {language} = useStore($data, {keys: ['language']});

    const countTotal = paths.length;
    const countRemaining = countTotal - remaining.length;
    const isPreparing = countTotal === 0;

    return (
        <AssistantMessage>
            <p className='inline-block mr-auto px-3 py-2 text-sm rounded-[1.5rem] bg-enonic-gray-100'>
                <span
                    className={twJoin([
                        'bg-gradient-middle bg-text-gradient-size from-black to-enonic-gray-400',
                        'text-transparent bg-clip-text animate-move-gradient',
                        'pl-1 text-sm text-left',
                    ])}
                >
                    <Trans
                        i18nKey={isPreparing ? 'text.translating.preparing' : 'text.translating.progress'}
                        values={
                            isPreparing
                                ? {}
                                : {
                                      language: language.name,
                                      progress: countRemaining,
                                      total: countTotal,
                                  }
                        }
                        components={{
                            framed: <FramedText />,
                            bold: <span className='font-bold' />,
                        }}
                    />
                </span>
            </p>
        </AssistantMessage>
    );
}
