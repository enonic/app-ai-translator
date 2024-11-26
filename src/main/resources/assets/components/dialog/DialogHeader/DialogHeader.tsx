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
        <div className={twJoin(['DialogHeader grid grid-cols-header', className])}>
            <div className='pr-2 leading-10 font-normal text-2xl h-16 pl-5 pt-3'>{title}</div>
            <div className='text-nowrap'>
                <CloseButton />
            </div>
        </div>
    );
}
