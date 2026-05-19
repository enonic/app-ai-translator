import type { LicenseResponse } from '../../shared/types/license';

import * as licenseManager from '../../lib/license/licenseManager';

export function get(): LicenseResponse {
  const [licenseState, error] = licenseManager.getLicenseState();

  return {
    status: error ? 500 : 200,
    contentType: 'application/json',
    body: error ?? { licenseState },
  };
}
