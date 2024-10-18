import {useStore} from '@nanostores/react';

import {$visible} from '../../stores/dialog';
import TranslationDialog from '../dialog/TranslationDialog/TranslationDialog';

export default function App(): JSX.Element {
    const visible = useStore($visible);

    return visible ? <TranslationDialog /> : <></>;
}
