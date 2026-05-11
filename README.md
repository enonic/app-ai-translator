# Juke AI: Translator

Translator, one of the Enonic Juke AI skills, is designed to enhance your productivity by leveraging advanced Large Language Models for translation tasks.

## Installation

```shell
./gradlew deploy
```

## Configuration

### 1. Google Service Account Key (SAK)

In order to use this application, you need to obtain a Google Service Account Key (SAK) in JSON format and have it accessible in your file system. [Contact us](https://www.enonic.com/company/contact-us) if you need assistance with this step.

### 2. Application Configuration

1. **Create the Configuration File**

   Create a configuration file in the `$XP_HOME/config` directory named `com.enonic.app.ai.translator.cfg`.

2. **Add the Following Properties**

- `google.api.sak.path`: Path to the Google Service Account Key (SAK) file on your system. Use Unix-style paths or properly escape backslashes.

## Configuration File

`com.enonic.app.ai.contentoperator.cfg (sample)`

```properties
# Path to Google's Service Account Key (a JSON file)
google.api.sak.path=${xp.home}/config/playground-123456-e13cb1841f87.json

# (Optional) Override the full Vertex AI generateContent endpoint URL.
# See "Vertex AI endpoint" below for guidance on regional vs multi-region vs global endpoints.
# Default: https://aiplatform.eu.rep.googleapis.com/v1/projects/<projectId>/locations/eu/publishers/google/models/gemini-3.1-flash-lite
# google.api.gemini.url=https://aiplatform.eu.rep.googleapis.com/v1/projects/playground-123456/locations/eu/publishers/google/models/gemini-3.1-flash-lite

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```

## Vertex AI endpoint

The model URL has three flavours, each with a different host and `locations/` segment. Pick one based on data-residency and model availability. Reference: [Vertex AI locations — Multi-region](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/locations#multi-region_1).

| Flavour | Host | `locations/` | When to use |
| --- | --- | --- | --- |
| **Multi-region (EU)** — default | `aiplatform.eu.rep.googleapis.com` | `eu` | Data stays inside the EU, capacity pooled across EU data centres. Required for models not yet rolled out to single regions (e.g. `gemini-3.1-flash-lite`). |
| **Single region** | `<region>-aiplatform.googleapis.com` (e.g. `europe-west1-aiplatform.googleapis.com`) | `<region>` (e.g. `europe-west1`) | Strict single-region data residency. Some preview/newer models may not be available. |
| **Global** | `aiplatform.googleapis.com` | `global` | Best availability and lowest latency. **No data-residency guarantee** — requests may be routed anywhere. |

URL template:

```
https://<host>/v1/projects/<projectId>/locations/<location>/publishers/google/models/<modelId>
```

The app appends `:generateContent` automatically. If you set `google.api.gemini.url`, supply the full URL without the `:generateContent` suffix.

If the chosen model isn't served at the chosen location you will get a `404 Not Found` with an empty body. Either switch endpoint flavour or pick a model published at that location — see [Generative AI on Vertex AI: model versions](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions).
