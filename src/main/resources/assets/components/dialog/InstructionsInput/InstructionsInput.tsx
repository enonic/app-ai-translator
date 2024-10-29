import {useStore} from '@nanostores/react';
import {useEffect, useId, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {twJoin, twMerge} from 'tailwind-merge';

import {
    $dialog,
    $instructions,
    enableInstructions,
    setDialogInstructions,
    toggleDialogInstructions,
} from '../../../stores/dialog';
import ActionButton from '../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
};

export default function InstructionsInput({className}: Props): React.ReactNode {
    const {t} = useTranslation();
    const instructionsId = useId();
    const instructions = useStore($instructions);
    const {instructionsVisible, instructionsEnabled} = useStore($dialog, {
        keys: ['instructionsVisible', 'instructionsEnabled'],
    });
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (instructionsVisible) {
            ref.current?.focus();
        }
    }, [instructionsVisible]);

    return (
        <section
            className={twMerge(
                'flex flex-col border',
                instructionsEnabled ? 'border-gray-300 rounded' : 'border-transparent',
                className,
            )}
        >
            <ActionButton
                className={twJoin('max-w-none h-8 mr-auto px-2', instructionsEnabled && 'hidden')}
                icon='plus'
                name={t('action.addInstructions')}
                size='sm'
                clickHandler={enableInstructions}
            />
            <ActionButton
                className={twJoin(
                    'max-w-none justify-start h-8 px-2 text-enonic-gray-600',
                    !instructionsEnabled && 'hidden',
                )}
                icon={instructionsVisible ? 'chevronDown' : 'chevronRight'}
                name={t('field.instructions.title')}
                size='sm'
                clickHandler={toggleDialogInstructions}
            />
            <textarea
                id={instructionsId}
                className={twJoin(
                    'w-full min-h-9 p-2 text-sm rounded border-none',
                    'empty:text-enonic-gray-600',
                    (!instructionsVisible || !instructionsEnabled) && 'hidden',
                )}
                placeholder={t('field.instructions.placeholder')}
                onChange={e => setDialogInstructions(e.target.value)}
                value={instructions}
                ref={ref}
            />
        </section>
    );
}
