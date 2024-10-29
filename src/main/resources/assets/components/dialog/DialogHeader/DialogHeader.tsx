import {useTranslation} from 'react-i18next';
import {twJoin} from 'tailwind-merge';

import CloseButton from '../CloseButton/CloseButton';

type Props = {
    className?: string;
};

export default function DialogHeader({className}: Props): React.ReactNode {
    const {t} = useTranslation();

    const title = t('field.title');

    return (
        <div className={twJoin(['DialogHeader grid grid-cols-header h-10', className])}>
            <div className='pl-12 pr-2 text-center leading-10 font-semibold'>{title}</div>
            <div className='text-right text-nowrap'>
                <CloseButton />
            </div>
        </div>
    );
}
