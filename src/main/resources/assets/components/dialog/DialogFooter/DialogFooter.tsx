import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';

import {translate} from '../../..';
import {$instructions, setDialogVisible} from '../../../stores/dialog';
import {$translating} from '../../../stores/requests';
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
        <div className={clsx(['DialogFooter', 'flex justify-end', 'px-3 py-3', 'gap-3', className])}>
            <ActionButton
                ref={ref}
                className='text-white bg-enonic-blue enabled:hover:bg-enonic-blue-light'
                name={t('action.translate')}
                size='lg'
                mode={isTranslating ? 'full' : 'text-only'}
                icon='spinner'
                disabled={isTranslating}
                clickHandler={() => {
                    void translate($instructions.get());
                    setDialogVisible(false);
                }}
            />
            <ActionButton
                className='text-white bg-enonic-gray-500 enabled:hover:bg-enonic-gray-400'
                name={t('action.cancel')}
                size='lg'
                mode='text-only'
                clickHandler={() => {
                    setDialogVisible(false);
                }}
            />
        </div>
    );
}
