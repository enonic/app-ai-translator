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

# (Optional) (Default: "all") A comma separated list of debug groups to limit the debug output, not enforce it.
# Possible values: all, none, google, func, ws
# Leaving empty or adding "all" to list will log all debug groups.
log.debug.groups=all
```
