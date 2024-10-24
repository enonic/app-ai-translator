import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import CloseButton from '../CloseButton/CloseButton';

type Props = {
    className?: string;
};

export default function DialogHeader({className}: Props): JSX.Element {
    const {t} = useTranslation();

    const title = t('field.title');

    return (
        <div className={clsx(['DialogHeader', 'grid grid-cols-header', 'h-10', className])}>
            <div className={clsx(['pl-12 pr-2', 'text-center leading-10 font-semibold', className])}>{title}</div>
            <div className='text-right text-nowrap'>
                <CloseButton />
            </div>
        </div>
    );
}
