import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

type Props = {
    className?: string;
};

export default function HeaderTitle({className}: Props): JSX.Element {
    const {t} = useTranslation();

    const title = t('field.title');

    return (
        <div
            className={clsx([
                'flex justify-center items-center flex-nowrap',
                'px-2',
                'text-sm text-enonic-gray text-center',
                className,
            ])}
        >
            <span>{title}</span>
        </div>
    );
}
