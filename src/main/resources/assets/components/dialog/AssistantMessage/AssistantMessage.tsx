import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import JukeIcon from '../../shared/JukeIcon/JukeIcon';

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function AssistantMessage({className, children}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <section className={twMerge('grid grid-cols-fit-1fr grid-rows-auto gap-y-1', className)}>
            <JukeIcon className='row-span-2' />
            <h6 className='pl-3 text-xs font-medium cursor-default'>{t('text.assistant.name')}</h6>
            <article className='animate-slide-fade-in'>{children}</article>
        </section>
    );
}
