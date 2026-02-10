import {ERRORS} from '../../shared/errors';
import {GOOGLE_GEMINI_URL, GOOGLE_SAK_PATH} from '../config';
import {APP_NAME} from '../constants';
import {logDebug, LogDebugGroups, logError} from '../logger';

type ClientOptions = {
    accessToken: string;
    url: string;
};

export function getOptions(): Try<ClientOptions> {
    const [options, err] = parseOptions();
    if (err) {
        logError(err);
        return [null, err];
    }
    return [options, null];
}

export function validateOptions(): void {
    const [, err] = parseOptions();
    if (err) {
        logError(err);
    }
}

export function parseOptions(): Try<ClientOptions> {
    logDebug(LogDebugGroups.GOOGLE, 'options.getOptions()');

    if (!GOOGLE_SAK_PATH) {
        return [null, ERRORS.GOOGLE_SAK_MISSING];
    }

    try {
        const handler = __.newBean(`${APP_NAME}.google.ServiceAccountKeyHandler`);

        const accessToken = handler.getAccessToken(GOOGLE_SAK_PATH);
        if (!accessToken) {
            return [null, ERRORS.GOOGLE_ACCESS_TOKEN_MISSING];
        }

        const projectId = handler.getProjectId(GOOGLE_SAK_PATH);
        if (!projectId) {
            return [null, ERRORS.GOOGLE_PROJECT_ID_MISSING];
        }

        const url = createModelGenerateUrl(projectId);

        return [
            {
                accessToken,
                url,
            },
            null,
        ];
    } catch (error) {
        return [null, ERRORS.GOOGLE_SAK_READ_FAILED.withMsg(String(error))];
    }
}

function createModelGenerateUrl(projectId: string): string {
    // Regional endpoint with EU data residency (europe-west1). Preview models may not be available.
    // Global endpoint routes to any available region (no data residency guarantee):
    // https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/<model>
    const baseUrl =
        GOOGLE_GEMINI_URL ||
        `https://europe-west1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/europe-west1/publishers/google/models/gemini-2.5-flash`;
    return `${baseUrl}:generateContent`;
}
