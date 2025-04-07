package com.enonic.app.ai.translator.internal;

import com.enonic.xp.script.ScriptValue;

public class Synchronizer
{
    public synchronized void sync( final ScriptValue callbackScriptValue )
    {
        callbackScriptValue.call();
    }
}
