export enum AiEvents {
    // Translator
    //   Outgoing
    DIALOG_SHOWN = 'AiTranslatorDialogShownEvent',
    DIALOG_HIDDEN = 'AiTranslatorDialogHiddenEvent',
    STARTED = 'AiTranslatorStartedEvent',
    COMPLETED = 'AiTranslatorCompletedEvent',
    ALL_COMPLETED = 'AiTranslatorAllCompletedEvent',
    //   Incoming
    OPEN_DIALOG = 'AiTranslatorOpenDialogEvent',
    CONFIGURE = 'AiTranslatorConfigureEvent',
    // Common
    //   Incoming
    UPDATE_DATA = 'AiUpdateDataEvent',
}

export type EventHandler<T extends Event = Event> = (event: T) => void;
export type CustomEventHandler = EventHandler<CustomEvent>;

export type SimpleDispatchableAiEvents = AiEvents.DIALOG_SHOWN | AiEvents.DIALOG_HIDDEN;

type StartedDetail = {
    path: string;
};

type CompletedDetail = {
    path: string;
    text?: string;
    success: boolean;
};

type AllCompletedDetail = {
    success: boolean;
    message?: string;
};

export function dispatch(type: SimpleDispatchableAiEvents): void {
    window.dispatchEvent(new CustomEvent(type));
}

export function dispatchStarted(detail: StartedDetail): void {
    window.dispatchEvent(new CustomEvent(AiEvents.STARTED, {detail}));
}

export function dispatchCompleted(detail: CompletedDetail): void {
    window.dispatchEvent(new CustomEvent(AiEvents.COMPLETED, {detail}));
}

export function dispatchAllCompleted(detail: AllCompletedDetail): void {
    window.dispatchEvent(new CustomEvent(AiEvents.ALL_COMPLETED, {detail}));
}

function addGlobalHandler(eventType: AiEvents, handler: CustomEventHandler): FnVoid {
    const eventHandler = (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event);
        }
    };
    window.addEventListener(eventType, eventHandler);
    return () => window.removeEventListener(eventType, eventHandler);
}

export function addGlobalUpdateDataHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(AiEvents.UPDATE_DATA, handler);
}

export function addGlobalConfigureHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(AiEvents.CONFIGURE, handler);
}

export function addGlobalOpenDialogHandler(handler: CustomEventHandler): FnVoid {
    return addGlobalHandler(AiEvents.OPEN_DIALOG, handler);
}

//
//* KEYBOARD & MOUSE
//
export type ReactKeyboardHandler<T> = (event: React.KeyboardEvent<T>) => void;
export type ReactMouseHandler<T> = (event: React.MouseEvent<T>) => void;

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

export function isEscapeKey(event: KeyboardEvent | React.KeyboardEvent): boolean {
    return event.code === 'Escape';
}

export function isApplyKey(event: KeyboardEvent | React.KeyboardEvent): boolean {
    return event.code === 'Enter' || event.code === 'NumpadEnter';
}

export function isSelectKey(event: KeyboardEvent | React.KeyboardEvent): boolean {
    return isApplyKey(event) || event.code === 'Space';
}
