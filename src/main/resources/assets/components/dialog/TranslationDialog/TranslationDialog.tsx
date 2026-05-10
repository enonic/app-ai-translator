import {useStore} from '@nanostores/react';
import {twMerge} from 'tailwind-merge';

import ModalWrapper from '@/ui/primitives/ModalWrapper';
import {$dialog, setDialogVisible} from '@/store/dialog';

import DialogContent from '@/components/dialog/DialogContent/DialogContent';
import DialogFooter from '@/components/dialog/DialogFooter/DialogFooter';
import DialogHeader from '@/components/dialog/DialogHeader/DialogHeader';

export type Props = {
    className?: string;
};

export default function TranslationDialog({className = ''}: Props): React.ReactNode {
    const {visible} = useStore($dialog, {keys: ['visible']});

    return (
        <ModalWrapper
            className={twMerge('TranslationDialog', !visible && 'hidden')}
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
