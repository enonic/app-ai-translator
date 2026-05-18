import { CustomAiError } from '@shared/errors';

import { $config } from '@/store/config';

import type { LicenseResponseState, LicenseState } from '@shared/types/license';

export async function fetchLicenseState(): Promise<LicenseState | AiError> {
  const licenseServiceUrl = $config.get().licenseServiceUrl;

  if (!licenseServiceUrl) {
    return new CustomAiError(500, 'License service URL is not configured.');
  }

  try {
    const response = await fetch(licenseServiceUrl);
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
