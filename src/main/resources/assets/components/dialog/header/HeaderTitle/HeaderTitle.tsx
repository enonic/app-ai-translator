import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

type Props = {
    className?: string;
};

export default function HeaderTitle({className}: Props): JSX.Element {
    const {t} = useTranslation();

    const title = t('field.title');

    return (
        <div className={clsx(['py-5 pl-7.5 pr-2', 'text-header-title font-bold', className])}>
            <span>{title}</span>
        </div>
    );
}
