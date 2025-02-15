# Juke AI: Translator

Translator, the Enonic's Juke AI plugin, is designed to enhance your productivity by leveraging advanced Large Language Models for translation tasks.

## Installation

```shell
./gradlew deploy
```

## Configuration

### 1. Google Service Account Key (SAK)

First, obtain a Google Service Account Key (SAK) to access the Vertex AI API. This key is a JSON file named in the format `%project_name%-%12_digit_number%.json`.

- **If you already have the JSON file**, you can skip this step.
- **Otherwise**, create a new one by following the steps in the [Service Account Key guide](docs/SERVICE_ACCOUNT_KEY.MD).


### 2. Application Configuration

1. **Create the Configuration File**

    Create a configuration file in the `$XP_HOME/config` directory named `com.enonic.app.ai.translator.cfg`.

2. **Add the Following Properties**
  - `google.api.gemini.url`: URL of a model from the Gemini family on Vertex AI. We recommend using Flash models for faster responses.

  - `google.api.sak.path`: Path to the Google Service Account Key (SAK) file on your system. Use Unix-style paths or properly escape backslashes.

For a list of available models, visit the [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden). Note that not all models are available in every region; for region-specific availability, refer to [Vertex AI Locations](https://cloud.google.com/vertex-ai/docs/general/locations).

You can find the example of the configuration file below.

## Configuration File

`com.enonic.app.ai.translator.cfg`
```properties
# Gemini Model URL on Google APIs
# `*:generateContent` last part must be dropped, as streaming support handled by the application
google.api.gemini.url=https://europe-west1-aiplatform.googleapis.com/v1/projects/playground-186616/locations/europe-west1/publishers/google/models/gemini-2.0-flash-001

# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=/Users/enonic/config/playground-123456-e13cb1841f87.json

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, cron, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
