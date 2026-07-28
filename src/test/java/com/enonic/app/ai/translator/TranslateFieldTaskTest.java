package com.enonic.app.ai.translator;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class TranslateFieldTaskTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/tasks/translateField/translateField-test.js";
    }
}
