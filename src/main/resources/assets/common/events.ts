export enum EnonicAiEvents {
    // Translator
    STARTED = 'EnonicAiTranslatorStartedEvent',
    COMPLETED = 'EnonicAiTranslatorCompletedEvent',
    // Common
    CONFIG = 'EnonicAiConfigEvent',
    DATA_SENT = 'EnonicAiDataSentEvent',
}

type TranslationStartedDetail = {
    path: string;
};

type TranslationCompletedDetail = {
    path: string;
    value: string;
};

type EventHandler<T extends Event = Event> = (event: T) => void;

export function dispatchStarted(detail: TranslationStartedDetail): void {
    window.dispatchEvent(new CustomEvent(EnonicAiEvents.STARTED, {detail}));
}

export function dispatchCompleted(detail: TranslationCompletedDetail): void {
    window.dispatchEvent(new CustomEvent(EnonicAiEvents.COMPLETED, {detail}));
}

function createEventHandler(handler: EventHandler<CustomEvent>): EventHandler {
    return (event: Event): void => {
        if (event instanceof CustomEvent) {
            handler(event);
        }
    };
}

export function addGlobalConfigHandler(handler: EventHandler<CustomEvent>): FnVoid {
    return addGlobalHandler(EnonicAiEvents.CONFIG, handler);
}

export function addGlobalDataSentHandler(handler: EventHandler<CustomEvent>): FnVoid {
    return addGlobalHandler(EnonicAiEvents.DATA_SENT, handler);
}

function addGlobalHandler(eventType: EnonicAiEvents, handler: EventHandler<CustomEvent>): FnVoid {
    const eventHandler = createEventHandler(handler);
    window.addEventListener(eventType, eventHandler);
    return () => window.removeEventListener(eventType, eventHandler);
}
