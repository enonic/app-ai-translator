import {useStore} from '@nanostores/react';
import {twMerge} from 'tailwind-merge';

import {$dialog, DialogView} from '../../../stores/dialog';
import CompletedView from '../view/CompletedView/CompletedView';
import PreparationView from '../view/PreparationView/PreparationView';
import ProcessingView from '../view/ProcessingView/ProcessingView';

type Props = {
    className?: string;
};

function createView(view: DialogView): React.ReactNode {
    switch (view) {
        case 'preparation':
            return <PreparationView />;
        case 'processing':
            return <ProcessingView />;
        case 'completed':
            return <CompletedView />;
    }
}

export default function DialogContent({className}: Props): React.ReactNode {
    const {view} = useStore($dialog, {keys: ['view']});

    return (
        <div className={twMerge('DialogContent flex flex-col gap-4 h-max px-5 pt-3 overflow-y-auto', className)}>
            {createView(view)}
        </div>
    );
}
