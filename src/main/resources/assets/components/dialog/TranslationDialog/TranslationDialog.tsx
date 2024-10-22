import {useStore} from '@nanostores/react';
import clsx from 'clsx';

import {translate} from '../../..';
import {$visible, setDialogVisible} from '../../../stores/dialog';
import ActionButton from '../../shared/ActionButton/ActionButton';
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
                'fixed',
                'max-w-[720px] min-w-[230px] w-[85.185%]',
                'fixed',
                'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
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
            <div className='TranslationButtons'>
                <ActionButton
                    name='translate'
                    handleClick={() => {
                        setDialogVisible(false);
                        void translate();
                    }}
                />
            </div>
        </div>
    );
}
