import {map} from 'nanostores';

import {addGlobalConfigureHandler} from '../common/events';
import {ConfigData} from './data/ConfigData';

export type Config = {
    restServiceUrl: string;
    wsServiceUrl: string;
    user: {
        fullName: string;
        shortName: string;
    };
    locales: string[];
    instructions: string;
};

export const $config = map<Config>({
    restServiceUrl: '',
    wsServiceUrl: '',
    user: {
        fullName: 'You',
        shortName: 'Y',
    },
    locales: ['en'],
    instructions: '',
});

export const setRestServiceUrl = (serviceRestUrl: string): void => $config.setKey('restServiceUrl', serviceRestUrl);
export const setWsServiceUrl = (serviceWsUrl: string): void => $config.setKey('wsServiceUrl', serviceWsUrl);
export const setUser = (user: Config['user']): void => $config.setKey('user', user);
export const setLocales = (locales: string[]): void => $config.setKey('locales', locales.slice());
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
