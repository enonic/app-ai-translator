package com.enonic.app.ai.translator.internal;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class WsMessages
{
    private static final Map<String, ConcurrentHashMap<String, String>> SESSIONS = new ConcurrentHashMap<>();

    public ConcurrentHashMap<String, String> forSession( final String sessionId )
    {
        return SESSIONS.computeIfAbsent( sessionId, key -> new ConcurrentHashMap<>() );
    }

    public void clear( final String sessionId )
    {
        SESSIONS.remove( sessionId );
    }
}
