import * as contextLib from '/lib/xp/context';

export function runAsAdmin<T>(fn: () => T): T {
    return contextLib.run({principals: ['role:system.admin']}, fn);
}
