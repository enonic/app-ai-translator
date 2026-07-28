var t = require('/lib/xp/testing');
var results = require('/lib/translate/results');

function samplePayload() {
    return {
        sessionId: 'session-1',
        path: {
            kind: 'mixin',
            mixin: 'com.enonic.app.example:seo',
            field: 'metaDescription'
        },
        entry: {
            value: 'Hello world',
            type: 'text',
            schemaType: 'TextLine',
            schemaLabel: 'Meta description'
        },
        targetLanguage: 'no',
        customInstructions: 'Keep it short'
    };
}

// The named task receives its config as JSON (ScriptValue -> PropertyTree -> JS), so the payload
// must survive a serialize/parse round-trip with no loss. This is what makes the redesign safe on
// GraalJS: data crosses the context boundary, never a closure.
exports.testPayloadRoundTripsLosslessly = function () {
    var payload = samplePayload();

    var restored = JSON.parse(JSON.stringify(payload));

    t.assertJsonEquals(payload, restored);
    t.assertEquals('session-1', restored.sessionId);
    t.assertEquals('mixin', restored.path.kind);
    t.assertEquals('metaDescription', restored.path.field);
    t.assertEquals('Hello world', restored.entry.value);
};

// The registry stores each field outcome as a JSON string so its value is host-safe across the
// producer (task) and consumer (poll loop) contexts. The codec must round-trip both variants.
exports.testCompletedOutcomeRoundTrips = function () {
    var outcome = {
        status: 'completed',
        path: {
            kind: 'data',
            field: 'title'
        },
        text: 'Hei verden'
    };

    var restored = results.decodeOutcome(results.encodeOutcome(outcome));

    t.assertJsonEquals(outcome, restored);
    t.assertEquals('completed', restored.status);
    t.assertEquals('Hei verden', restored.text);
};

exports.testFailedOutcomeRoundTrips = function () {
    var outcome = {
        status: 'failed',
        path: {
            kind: 'topic'
        },
        code: 9000,
        message: 'Unknown error.'
    };

    var restored = results.decodeOutcome(results.encodeOutcome(outcome));

    t.assertJsonEquals(outcome, restored);
    t.assertEquals('failed', restored.status);
    t.assertEquals(9000, restored.code);
    t.assertEquals('topic', restored.path.kind);
};
