import cloneDeep from 'lodash.clonedeep';

globalThis.structuredClone = cloneDeep;

// XP runtime globals
(globalThis as unknown as { app: unknown }).app = {
    config: {
        'log.debug.groups': 'none',
    },
};

(globalThis as unknown as { log: unknown }).log = console;
