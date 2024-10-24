import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {$data} from '../../../stores/data';
import JukeIcon from '../../shared/JukeIcon/JukeIcon';

type Props = {
    className?: string;
};

export default function AssistantMessage({className}: Props): JSX.Element {
    const {language} = useStore($data, {keys: ['language']});
    const {t} = useTranslation();

    return (
        <section className={twMerge(clsx('grid grid-cols-fit-1fr grid-rows-auto gap-y-1', className))}>
            <JukeIcon className='row-span-2' />
            <h6 className='pl-3 text-xs cursor-default font-medium'>{t('text.assistant.name')}</h6>
            <article className='mr-auto px-3 py-2 text-sm rounded-[1.5rem] bg-enonic-gray-100'>
                {t('text.greeting')}
                <span className='inline-flex px-1 py-0 align-baseline rounded border border-slate-300 font-semibold'>
                    {language.name}
                </span>{' '}
                ?
            </article>
        </section>
    );
}
