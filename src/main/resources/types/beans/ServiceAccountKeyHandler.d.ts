declare interface ServiceAccountKeyHandler {
    /**
     * Retrieves an access token for the given service account key path.
     * @param serviceAccountKeyPath The path to the service account key file.
     * @returns The access token string.
     * @throws {Error} If there's an issue retrieving the access token.
     */
    getAccessToken(serviceAccountKeyPath: string): string;

    /**
     * Retrieves the project ID associated with the given service account key path.
     * @param serviceAccountKeyPath The path to the service account key file.
     * @returns The project ID string.
     * @throws {Error} If there's an issue retrieving the project ID.
     */
    getProjectId(serviceAccountKeyPath: string): string;
}

interface XpBeans {
    'com.enonic.app.ai.translator.google.ServiceAccountKeyHandler': ServiceAccountKeyHandler;
}
