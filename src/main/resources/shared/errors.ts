export class CustomAiError implements AiError {
    constructor(
        public code: number,
        public message: string,
    ) {}

    withMsg(message: string, replace?: boolean): CustomAiError {
        if (message == null || message === '') {
            return this;
        }
        return new CustomAiError(this.code, replace ? message : `${this.message} ${message}`);
    }

    is(error: unknown): boolean {
        return isAiError(error) && this.code === error.code;
    }

    toString(): string {
        return `AI Error [${this.code}]: ${this.message}`;
    }
}

function isAiError(error: unknown): error is AiError {
    if (error == null || typeof error !== 'object' || Array.isArray(error)) {
        return false;
    }

    if (error instanceof CustomAiError) {
        return true;
    }

    return 'code' in error && typeof error.code === 'number' && 'message' in error && typeof error.message === 'string';
}

const err = (code: number, message: string): CustomAiError => new CustomAiError(code, message);

export const ERRORS = {
    // REST Errors 0000
    REST_REQUEST_FAILED: err(0, 'REST request failed.'),
    RESPONSE_BODY_MISSING: err(1, 'REST response body is missing.'),
    REST_NOT_AUTHENTICATED: err(401, 'Not authenticated.'),
    REST_NOT_FOUND: err(404, 'Not found.'),
    REST_UNHANDLED_ERROR: err(500, 'Unhandled server error.'),
    // WS Errors 0600
    WS_INVALID_PROTOCOL: err(601, 'Invalid WebSocket protocol.'),

    // Node Errors 1000

    // Query Errors 2000
    QUERY_CONTENT_NOT_FOUND: err(2000, 'Content not found.'),
    QUERY_CONTENT_TYPE_NOT_FOUND: err(2001, 'Content type not found.'),

    // Function Errors 3000
    FUNC_INSUFFICIENT_DATA: err(3000, 'Insufficient data.'),
    FUNC_UNKNOWN_MODE: err(3001, 'Unknown AI mode.'),
    FUNC_NO_TRANSLATABLE_FIELDS: err(3002, 'No translatable fields found.'),
    FUNC_TRANSLATION_EMPTY: err(3003, 'Translation is empty.'),

    // Model Errors 4000
    MODEL_UNEXPECTED: err(4000, 'Generation finished unexpectedly.'),
    MODEL_MAX_TOKENS: err(4001, 'Max tokens limit reached.'),
    MODEL_SAFETY: err(4002, 'Generation was stopped due to safety reasons.'),
    MODEL_PROHIBITED_CONTENT: err(4003, 'Generation was stopped, because of prohibited content.'),
    MODEL_SPII: err(4004, 'Generation was stopped, because of Sensitive Personally Identifiable Information.'),
    MODEL_UNKNOWN_ERROR: err(4010, 'Model: Unknown error.'),
    MODEL_INVALID_ARGUMENT: err(4011, 'Model: Invalid argument.'),
    MODEL_FAILED_PRECONDITION: err(4012, 'Model: Failed precondition.'),

    // Google Errors 5000
    GOOGLE_SAK_MISSING: err(5000, 'Google Service Account Key is missing or invalid.'),
    GOOGLE_SAK_READ_FAILED: err(5001, 'Failed to read Google Service Account Key.'),
    GOOGLE_ACCESS_TOKEN_MISSING: err(5002, 'Google Access Token is missing or invalid.'),
    GOOGLE_PROJECT_ID_MISSING: err(5003, 'Google Project ID is missing or invalid.'),
    GOOGLE_REQUEST_FAILED: err(5010, 'Request to Google API failed.'),
    GOOGLE_RESPONSE_PARSE_FAILED: err(5020, 'Failed to parse Google response.'),
    GOOGLE_CANDIDATES_EMPTY: err(5040, 'Candidates in response are empty.'),
    GOOGLE_BLOCKED: err(5041, 'Generation was blocked.'),

    // License errors
    LICENSE_ERROR_MISSING: err(6000, 'No valid license found.'),
    LICENSE_ERROR_EXPIRED: err(6001, 'License expired.'),
    LICENSE_ERROR_UNKNOWN: err(6002, 'Error while fetching license state.'),

    // Other Errors 9000
    UNKNOWN_ERROR: err(9000, 'Unknown error.'),
} as const;
