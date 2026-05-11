export enum AiEvents {
  // Translator
  //   Outgoing
  NO_LICENSE = 'AiTranslatorNoLicenseEvent',
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

type CompletedDetail =
  | {
      path: string;
      text?: string;
      success: true;
    }
  | {
      path: string;
      message: string;
      success: false;
    };

type AllCompletedDetail = {
  success: boolean;
  message?: string;
};

export function dispatch(type: SimpleDispatchableAiEvents): void {
  window.dispatchEvent(new CustomEvent(type));
}

export function dispatchStarted(detail: StartedDetail): void {
  window.dispatchEvent(new CustomEvent(AiEvents.STARTED, { detail }));
}

export function dispatchCompleted(detail: CompletedDetail): void {
  window.dispatchEvent(new CustomEvent(AiEvents.COMPLETED, { detail }));
}

export function dispatchAllCompleted(detail: AllCompletedDetail): void {
  window.dispatchEvent(new CustomEvent(AiEvents.ALL_COMPLETED, { detail }));
}

export function dispatchNoLicense(): void {
  window.dispatchEvent(new CustomEvent(AiEvents.NO_LICENSE));
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
