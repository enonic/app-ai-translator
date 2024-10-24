import {useStore} from '@nanostores/react';
import {useId} from 'react';
import {useTranslation} from 'react-i18next';

import {$instructions, setDialogInstructions} from '../../../stores/dialog';

type Props = {
    className?: string;
};

export default function InstructionsInput({className}: Props): JSX.Element {
    const {t} = useTranslation();
    const instructionsId = useId();
    const instructions = useStore($instructions);

    return (
        <section className={className}>
            <label htmlFor={instructionsId} className='text-sm text-enonic-gray-600'>
                {t('field.instructions.title')}
            </label>
            <textarea
                id={instructionsId}
                className='w-full text-sm rounded border border-gray-300 p-2 empty:text-enonic-gray-600'
                placeholder={t('field.instructions.placeholder')}
                onChange={e => setDialogInstructions(e.target.value)}
                value={instructions}
            />
        </section>
    );
}
