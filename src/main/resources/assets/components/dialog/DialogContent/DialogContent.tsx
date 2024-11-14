import {twMerge} from 'tailwind-merge';

import AssistantMessage from '../AssistantMessage/AssistantMessage';
import InstructionsInput from '../InstructionsInput/InstructionsInput';

type Props = {
    className?: string;
};

export default function DialogContent({className}: Props): React.ReactNode {
    return (
        <div className={twMerge('DialogContent flex flex-col gap-4 h-max px-3 pt-3 overflow-y-auto', className)}>
            <AssistantMessage />
            <InstructionsInput />
        </div>
    );
}
