import {useStore} from '@nanostores/react';
import React from 'react';
import {Trans} from 'react-i18next';

import {$items} from '../../../../stores/items';

export default function TranslationResult(): React.ReactNode {
    const {failed, globalFailure} = useStore($items);
    const failedCount = failed.length;

    if (globalFailure) {
        return (
            <Trans
                i18nKey='text.result.failed.all'
                values={{reason: globalFailure}}
                components={{italic: <span className='italic' />}}
            />
        );
    }

    if (failedCount === 0) {
        return <Trans i18nKey='text.result.completed' />;
    }

    return (
        <Trans
            i18nKey='text.result.failed.some'
            values={{count: failedCount}}
            components={{bold: <span className='font-bold' />}}
        />
    );
}
