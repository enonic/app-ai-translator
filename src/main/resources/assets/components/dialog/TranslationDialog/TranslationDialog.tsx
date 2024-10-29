import {useStore} from '@nanostores/react';
import clsx from 'clsx';

import {$dialog, setDialogVisible} from '../../../stores/dialog';
import ModalWrapper from '../../shared/ModalWrapper/ModalWrapper';
import DialogContent from '../DialogContent/DialogContent';
import DialogFooter from '../DialogFooter/DialogFooter';
import DialogHeader from '../DialogHeader/DialogHeader';

export type Props = {
    className?: string;
};

export default function TranslationDialog({className = ''}: Props): React.ReactNode {
    const {visible} = useStore($dialog, {keys: ['visible']});

    return (
        <ModalWrapper
            className={clsx(['enonic-ai TranslationDialog', {hidden: !visible}])}
            closeHandler={() => setDialogVisible(false)}
            trapFocus={visible}
        >
            <div
                className={clsx(
                    'w-full sm2:max-w-2xl',
                    'h-dvh sm2:h-auto',
                    'flex flex-col',
                    'bg-white',
                    'sm2:shadow-xl',
                    'rounded-sm',
                    className,
                )}
                role='dialog'
                aria-modal='true'
            >
                <DialogHeader />
                <DialogContent className='max-h-[calc(100vh-6.5rem)]' />
                <DialogFooter className='mt-auto sm2:mt-0' />
            </div>
        </ModalWrapper>
    );
}
