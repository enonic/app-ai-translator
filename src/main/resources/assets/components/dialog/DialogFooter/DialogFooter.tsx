import {useStore} from '@nanostores/react';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {$dialog, setDialogView, setDialogVisible} from '../../../stores/dialog';
import {$items} from '../../../stores/items';
import {$translating, startTranslation, stopTranslation} from '../../../stores/websocket';
import ActionButton from '../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function DialogFooter({className}: Props): React.ReactNode {
    const isTranslating = useStore($translating);
    const {view} = useStore($dialog);
    const {paths, failed, remaining} = useStore($items);
    const canSave = failed.length !== paths.length && remaining.length !== paths.length;
    const isDone = view === 'completed';
    const isPreparing = view === 'preparation';

    const {t} = useTranslation();
    const ref = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className={twMerge('DialogFooter flex justify-end px-5 py-5 gap-2.5', className)}>
            <ActionButton
                ref={ref}
                className={twMerge(
                    'h-8.5 px-5 rounded-none',
                    'text-white bg-enonic-blue enabled:hover:bg-enonic-blue-light',
                    !isPreparing && 'hidden',
                )}
                name={t('action.translate')}
                size='sm'
                mode={isTranslating ? 'full' : 'text-only'}
                icon='spinner'
                disabled={isTranslating}
                clickHandler={() => {
                    startTranslation();
                    setDialogView('processing');
                }}
            />
            <ActionButton
                className='h-8.5 px-5 rounded-none text-white bg-enonic-gray-500 enabled:hover:bg-enonic-gray-400'
                name={t(isDone ? 'action.close' : 'action.cancel')}
                size='sm'
                mode='text-only'
                clickHandler={() => {
                    if (!isDone) {
                        stopTranslation(!canSave);
                    }
                    setDialogVisible(false);
                }}
            />
        </div>
    );
}
