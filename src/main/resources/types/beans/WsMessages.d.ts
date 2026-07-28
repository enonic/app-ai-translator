declare interface WsMessages {
  forSession(sessionId: string): ConcurrentHashMap<string, string>;
  clear(sessionId: string): void;
}

interface XpBeans {
  'com.enonic.app.ai.translator.internal.WsMessages': WsMessages;
}
