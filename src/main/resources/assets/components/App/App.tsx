import {useStore} from '@nanostores/react';

import {$hasData} from '../../stores/data';
import TranslationDialog from '../dialog/TranslationDialog/TranslationDialog';

export default function App(): React.ReactNode {
    const hasData = useStore($hasData);

    return hasData ? <TranslationDialog className='text-base' /> : <></>;
}
