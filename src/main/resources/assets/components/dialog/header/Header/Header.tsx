import clsx from 'clsx';

import CloseButton from '../CloseButton/CloseButton';
import HeaderTitle from '../HeaderTitle/HeaderTitle';

type Props = {
    className?: string;
};

export default function Header({className}: Props): JSX.Element {
    return (
        <div
            className={clsx([
                'Header',
                'grid grid-cols-mid-3 items-center',
                'h-10',
                'bg-enonic-gray-lighter',
                className,
            ])}
        >
            <HeaderTitle className='drag-handle self-stretch' />
            <div className='text-right text-nowrap'>
                <CloseButton />
            </div>
        </div>
    );
}
