import { addGlobalConfigureHandler } from '@/common/events';

import type { Config, ConfigData } from './config.types';

import { $config } from './config.store';

export const setLicenseServiceUrl = (serviceRestUrl: string): void =>
  $config.setKey('licenseServiceUrl', serviceRestUrl);
export const setWsServiceUrl = (serviceWsUrl: string): void =>
  $config.setKey('wsServiceUrl', serviceWsUrl);
export const setUser = (user: Config['user']): void => $config.setKey('user', user);
export const setInstructions = (instructions: string): void =>
  $config.setKey('instructions', instructions);

addGlobalConfigureHandler((event: CustomEvent<ConfigData>) => {
  const { user, instructions } = event.detail.payload;

  if (user) {
    setUser(user);
  }
  if (instructions) {
    setInstructions(instructions);
  }
});
