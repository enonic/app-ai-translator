import FocusTrap from 'focus-trap-react';
import {useCallback, useEffect} from 'react';
import {twMerge} from 'tailwind-merge';

import {addGlobalKeydownHandler, isEscapeKey} from '../../../common/events';

export type Props = {
    className?: string;
    children: React.ReactNode;
    trapFocus?: boolean;
    closeHandler: () => void;
};

export default function ModalWrapper({className, children, trapFocus, closeHandler}: Props): React.ReactNode {
    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
            if (isEscapeKey(event)) {
                closeHandler();
            }
        },
        [closeHandler],
    );

    useEffect(() => {
        return addGlobalKeydownHandler(handleEscape);
    }, [handleEscape]);

    return (
        <FocusTrap active={trapFocus} focusTrapOptions={{initialFocus: false, allowOutsideClick: true}}>
            <div className={twMerge('fixed inset-0 flex justify-center items-center z-[2000]', className)}>
                <div
                    className='absolute inset-0 bg-black bg-opacity-60 backdrop-blur-xs -z-10'
                    role='presentation'
                    onClick={closeHandler}
                ></div>
                {children}
            </div>
        </FocusTrap>
    );
}
