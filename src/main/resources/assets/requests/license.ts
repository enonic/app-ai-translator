import {CustomAiError} from '../../shared/errors';
import {LicenseResponseState, LicenseState} from '../../shared/types/license';
import {$config} from '../stores/config';

export async function fetchLicenseState(): Promise<LicenseState | AiError> {
    try {
        const response = await fetch($config.get().licenseServiceUrl);
        const responseBody = (await response.json()) as LicenseResponseState | AiError;

        if (response.status === 200) {
            return (responseBody as LicenseResponseState).licenseState;
        }

        return responseBody as AiError;
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return new CustomAiError(500, msg);
    }
}
