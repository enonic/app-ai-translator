import { ERRORS } from '../../shared/errors';
import { GOOGLE_GEMINI_URL, GOOGLE_SAK_PATH } from '../config';
import { APP_NAME } from '../constants';
import { logDebug, LogDebugGroups, logError } from '../logger';

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
  // ? EU multi-region (`eu`) keeps data inside the EU while pooling capacity across EU data centres
  // ? — required for models not yet available in single-region endpoints (e.g. gemini-3.1-flash-lite).
  // ? Multi-region uses a dedicated host: `aiplatform.eu.rep.googleapis.com` with `locations/eu`.
  // ? Single region alternative: `europe-west1-aiplatform.googleapis.com` with `locations/europe-west1`.
  // ? Global (no data residency): `aiplatform.googleapis.com` with `locations/global`.
  // ? See https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/locations
  const baseUrl =
    GOOGLE_GEMINI_URL ||
    `https://aiplatform.eu.rep.googleapis.com/v1/projects/${projectId}/locations/eu/publishers/google/models/gemini-3.1-flash-lite`;
  return `${baseUrl}:generateContent`;
}
