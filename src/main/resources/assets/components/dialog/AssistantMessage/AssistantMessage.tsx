import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {Trans, useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {$data} from '../../../stores/data';
import JukeIcon from '../../shared/JukeIcon/JukeIcon';
import Language from '../../shared/Language/Language';

type Props = {
    className?: string;
};

export default function AssistantMessage({className}: Props): React.ReactNode {
    const {language} = useStore($data, {keys: ['language']});
    const {t} = useTranslation();

    return (
        <section className={twMerge(clsx('grid grid-cols-fit-1fr grid-rows-auto gap-y-1', className))}>
            <JukeIcon className='row-span-2' />
            <h6 className='pl-3 text-xs cursor-default font-medium'>{t('text.assistant.name')}</h6>
            <article className='mr-auto px-3 py-2 text-sm rounded-[1.5rem] bg-enonic-gray-100'>
                <Trans i18nKey='text.greeting' components={[<Language key='language' language={language.name} />]} />
            </article>
        </section>
    );
}
