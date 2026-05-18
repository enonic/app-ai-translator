import { map } from 'nanostores';

import type { Config } from './config.types';

export const $config = map<Config>({
  licenseServiceUrl: '',
  wsServiceUrl: '',
  user: {
    fullName: 'You',
    shortName: 'Y',
  },
  instructions: '',
});
