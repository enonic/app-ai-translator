import type { Config } from './config.types';

import { $config } from './config.store';

export const setConfig = (config: Config): void => $config.set(config);

export const setInstructions = (instructions: string): void =>
  $config.setKey('instructions', instructions);
