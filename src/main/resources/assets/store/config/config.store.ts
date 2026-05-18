import { map } from 'nanostores';

import type { Config } from './config.types';

export const $config = map<Config>({
  wsServiceUrl: '',
  licenseServiceUrl: '',
  instructions: '',
});
