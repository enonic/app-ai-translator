import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import {$data} from '../../../stores/data';
import Icon from '../../shared/Icon/Icon';
import LoadingIcon from '../../shared/LoadingIcon/LoadingIcon';

export type ThinkingItem = {
    path: string;
    status: 'pending' | 'succeeded' | 'failed';
    error?: string;
};

type Props = {
    items: ThinkingItem[];
};

export default function ThinkingMessage({items}: Props): React.ReactNode {
    const {t} = useTranslation();

    const countTotal = items.length;
    const countProcessed = items.filter(item => item.status !== 'pending').length;
    const hasFields = countTotal > 0;

    const {language} = useStore($data, {keys: ['language']});

    return (
        <>
            <p
                className={twJoin(
                    'max-w-none justify-start min-h-8 h-auto px-2 py-1.5',
                    !hasFields && 'enabled:hover:bg-white enabled:hover:cursor-default',
                )}
            >
                <span
                    className={twJoin([
                        'bg-gradient-middle bg-text-gradient-size from-black to-enonic-gray-400',
                        'text-transparent bg-clip-text animate-move-gradient',
                        'pl-1 text-sm text-left',
                    ])}
                >
                    {t('text.translating.progress', {
                        language: language.name,
                        progress: countProcessed,
                        total: countTotal,
                    })}
                </span>
            </p>
            <ul className={twJoin('flex flex-col gap-1 pl-6 divide-y', !expanded && 'hidden')}>
                {items.map(item => (
                    <li key={item.path} className='flex items-center gap-0.5 min-h-6'>
                        <p className='-mx-1 px-1 align-baseline truncate inline-flex'>
                            <span className='text-xs'>{item.path}</span>
                        </p>
                        {item.status === 'pending' && <LoadingIcon className='w-4 h-4' />}
                        {item.status === 'succeeded' && (
                            <Icon name='checkCircle' className='w-4 h-4 text-enonic-green' />
                        )}
                        {item.status === 'failed' && <Icon name='xCircle' className='w-4 h-4 text-enonic-red' />}
                    </li>
                ))}
            </ul>
        </>
    );
}
