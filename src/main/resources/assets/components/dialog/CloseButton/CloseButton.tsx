import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {$dialog, setDialogVisible} from '../../../stores/dialog';
import {$items} from '../../../stores/items';
import {stopTranslation} from '../../../stores/websocket';
import ActionButton from '../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function CloseButton({className}: Props): React.ReactNode {
    const {view} = useStore($dialog);
    const {paths, failed, remaining} = useStore($items);
    const isDone = view === 'completed';
    const canSave = failed.length !== paths.length && remaining.length !== paths.length;

    const {t} = useTranslation();

    return (
        <ActionButton
            className={twMerge(
                'CloseButton',
                'bg-transparent enabled:bg-transparent',
                'text-enonic-gray-600 enabled:hover:text-black enabled:hover:active:text-enonic-blue',
                className,
            )}
            name={t('action.close')}
            icon='close'
            mode='icon-only'
            size='lg'
            clickHandler={() => {
                if (!isDone) {
                    stopTranslation(canSave);
                }
                setDialogVisible(false);
            }}
        />
    );
}
