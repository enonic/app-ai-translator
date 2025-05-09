import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {setDialogVisible} from '../../../stores/dialog';
import {stopTranslation} from '../../../stores/websocket';
import ActionButton from '../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function CloseButton({className}: Props): React.ReactNode {
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
                stopTranslation();
                setDialogVisible(false);
            }}
        />
    );
}
