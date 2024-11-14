import {useStore} from '@nanostores/react';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {setDialogVisible} from '../../../stores/dialog';
import {$translating, startTranslation} from '../../../stores/websocket';
import ActionButton from '../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function DialogFooter({className}: Props): React.ReactNode {
    const isTranslating = useStore($translating);

    const {t} = useTranslation();
    const ref = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <div className={twMerge('DialogFooter flex justify-end px-3 py-3 gap-2.5', className)}>
            <ActionButton
                ref={ref}
                className='h-8.5 px-5 rounded-none text-white bg-enonic-blue enabled:hover:bg-enonic-blue-light'
                name={t('action.translate')}
                size='sm'
                mode={isTranslating ? 'full' : 'text-only'}
                icon='spinner'
                disabled={isTranslating}
                clickHandler={() => {
                    startTranslation();
                    setDialogVisible(false);
                }}
            />
            <ActionButton
                className='h-8.5 px-5 rounded-none text-white bg-enonic-gray-500 enabled:hover:bg-enonic-gray-400'
                name={t('action.cancel')}
                size='sm'
                mode='text-only'
                clickHandler={() => {
                    setDialogVisible(false);
                }}
            />
        </div>
    );
}
