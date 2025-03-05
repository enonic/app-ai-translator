import * as licenseManager from '../../lib/license/license-manager';
import {LicenseResponse} from '../../shared/types/license';

export function get(): LicenseResponse {
    const [licenseState, error] = licenseManager.getLicenseState();

    return {
        status: error ? 500 : 200,
        contentType: 'application/json',
        body: error ?? {licenseState},
    };
}
