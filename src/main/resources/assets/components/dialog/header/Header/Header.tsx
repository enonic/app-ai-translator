import clsx from 'clsx';

import CloseButton from '../CloseButton/CloseButton';
import HeaderTitle from '../HeaderTitle/HeaderTitle';

type Props = {
    className?: string;
};

export default function Header({className}: Props): JSX.Element {
    return (
        <div className={clsx(['Header', 'grid grid-cols-header items-center', 'px-7.5 py-5', 'bg-white', className])}>
            <HeaderTitle />
            <div className='text-right text-nowrap'>
                <CloseButton />
            </div>
        </div>
    );
}
