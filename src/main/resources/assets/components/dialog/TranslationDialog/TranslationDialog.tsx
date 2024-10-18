import {useStore} from '@nanostores/react';
import clsx from 'clsx';

import {$visible} from '../../../stores/dialog';
import Header from '../header/Header/Header';

export type Props = {
    className?: string;
};

export default function TranslationDialog({className = ''}: Props): JSX.Element {
    const visible = useStore($visible);

    return (
        <div
            className={clsx(
                'enonic-ai',
                'TranslationDialog',
                'absolute',
                'flex flex-col',
                'leading-initial',
                'bg-white',
                'border',
                'shadow-xl',
                'z-[2000]',
                {hidden: !visible},
                className,
            )}
        >
            <Header />
            <div className='TranslationContent'></div>
            <div className='TranslationButtons'></div>
        </div>
    );
}
