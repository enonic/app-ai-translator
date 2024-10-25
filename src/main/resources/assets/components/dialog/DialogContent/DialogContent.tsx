import clsx from 'clsx';

import AssistantMessage from '../AssistantMessage/AssistantMessage';
import InstructionsInput from '../InstructionsInput/InstructionsInput';

type Props = {
    className?: string;
};

export default function DialogContent({className}: Props): JSX.Element {
    return (
        <div className={clsx(['DialogContent', 'flex flex-col gap-4', 'px-3 pt-3', 'overflow-y-auto', className])}>
            <AssistantMessage />
            <InstructionsInput />
        </div>
    );
}
