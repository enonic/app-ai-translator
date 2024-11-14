import {useStore} from '@nanostores/react';
import {twMerge} from 'tailwind-merge';

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
            className={twMerge('enonic-ai TranslationDialog', !visible && 'hidden')}
            closeHandler={() => setDialogVisible(false)}
            trapFocus={visible}
        >
            <div
                className={twMerge(
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
                <DialogContent className='sm2:max-h-[calc(100vh-8.5rem)]' />
                <DialogFooter className='mt-auto sm2:mt-0' />
            </div>
        </ModalWrapper>
    );
}
