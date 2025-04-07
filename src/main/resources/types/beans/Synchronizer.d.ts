declare interface Synchronizer {
    sync(scriptValue: ScriptValue): void;
}

interface XpBeans {
    'com.enonic.app.ai.translator.internal.Synchronizer': Synchronizer;
}
