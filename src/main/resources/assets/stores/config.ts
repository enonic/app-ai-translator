import {map} from 'nanostores';

import {addGlobalConfigureHandler} from '../common/events';
import {ConfigData} from './data/ConfigData';

export type Config = {
    licenseServiceUrl: string;
    wsServiceUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    instructions: string;
};

export const $config = map<Config>({
    licenseServiceUrl: '',
    wsServiceUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    instructions: '',
});

export const setLicenseServiceUrl = (serviceRestUrl: string): void =>
    $config.setKey('licenseServiceUrl', serviceRestUrl);
export const setWsServiceUrl = (serviceWsUrl: string): void => $config.setKey('wsServiceUrl', serviceWsUrl);
export const setUser = (user: Config['user']): void => $config.setKey('user', user);
export const setInstructions = (instructions: string): void => $config.setKey('instructions', instructions);

addGlobalConfigureHandler((event: CustomEvent<ConfigData>) => {
    const {user, instructions} = event.detail.payload;

    if (user) {
        setUser(user);
    }
    if (instructions) {
        setInstructions(instructions);
    }
});
