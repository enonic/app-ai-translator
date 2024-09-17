# Juke AI: Translator

Translator, the Enonic's Juke AI plugin, is designed to enhance your productivity by leveraging advanced Large Language Models for translation tasks.

## Installation

```shell
./gradlew deploy
```

## Configuration

`com.enonic.app.ai.translator.cfg`
```properties
# Gemini Model URL on Google APIs
# `*:generateContent` last part must be dropped, as streaming support handled by the application
google.api.gemini.url=https://us-central1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/us-central1/publishers/google/models/gemini-1.5-pro-001

# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=/Users/enonic/config/playground-186416-e13cb1741f87.json

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output.
# Possible values: all, none, openai, rest, node, query, func
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
