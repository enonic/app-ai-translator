import clsx from 'clsx';
import FocusTrap from 'focus-trap-react';
import {useCallback, useEffect} from 'react';

import {addGlobalKeydownHandler, isEscapeKey} from '../../../common/events';

export type Props = {
    className?: string;
    children: React.ReactNode;
    trapFocus?: boolean;
    closeHandler: () => void;
};

export default function ModalWrapper({className, children, trapFocus, closeHandler}: Props): JSX.Element {
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
        <FocusTrap active={trapFocus} focusTrapOptions={{initialFocus: false}}>
            <div className={clsx(['fixed inset-0', 'flex justify-center items-center', 'z-[2000]', className])}>
                <div
                    className={clsx(['absolute inset-0', 'bg-black bg-opacity-60 backdrop-blur-xs', '-z-10'])}
                    role='presentation'
                    onClick={closeHandler}
                ></div>
                {children}
            </div>
        </FocusTrap>
    );
}
