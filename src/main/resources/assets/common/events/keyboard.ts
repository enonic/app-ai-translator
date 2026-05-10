export type ReactKeyboardHandler<T extends EventTarget = HTMLElement> = (event: React.KeyboardEvent<T>) => void;
export type ReactMouseHandler<T extends EventTarget = HTMLElement> = (event: React.MouseEvent<T>) => void;

export type KeyboardHandler = (event: KeyboardEvent) => void;
export type MouseHandler = (event: MouseEvent) => void;

export type MouseKeyboardEvent<T extends HTMLElement = HTMLElement> = React.MouseEvent<T> | React.KeyboardEvent<T>;

function handleKeyboardEvent(event: KeyboardEvent, callback: KeyboardHandler, preventDefault: boolean): void {
    if (canUseCustomHandler(event)) {
        if (preventDefault) {
            event.preventDefault();
        }
        callback(event);
    }
}

function canUseCustomHandler(event: KeyboardEvent): boolean {
    const isTextArea = event.target instanceof HTMLTextAreaElement;
    if (isTextArea) {
        return false;
    }

    const isButton = event.target instanceof HTMLButtonElement;
    if (isButton && isSelectKey(event)) {
        return false;
    }

    const isInput = event.target instanceof HTMLInputElement;
    if (!isInput) {
        return true;
    }

    const {type} = event.target;
    return type !== 'text' && type !== 'file' && type !== 'password';
}

export function addGlobalKeydownHandler(handler: KeyboardHandler): FnVoid {
    const wrappedHandler = (event: KeyboardEvent) => void handleKeyboardEvent(event, handler, false);
    document.addEventListener('keydown', wrappedHandler);
    return () => document.removeEventListener('keydown', wrappedHandler);
}

export function isEscapeKey(event: KeyboardEvent | React.KeyboardEvent<HTMLElement>): boolean {
    return event.code === 'Escape';
}

export function isApplyKey(event: KeyboardEvent | React.KeyboardEvent<HTMLElement>): boolean {
    return event.code === 'Enter' || event.code === 'NumpadEnter';
}

export function isSelectKey(event: KeyboardEvent | React.KeyboardEvent<HTMLElement>): boolean {
    return isApplyKey(event) || event.code === 'Space';
}
