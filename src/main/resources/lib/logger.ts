import { CustomAiError } from '../shared/errors';
import { DEBUG_GROUPS } from './config';

export enum LogDebugGroups {
  ALL = 'all',
  NONE = 'none',
  GOOGLE = 'google',
  FUNC = 'func',
  CRON = 'cron',
  WS = 'ws',
}

function stringifyCode(code: object): string | undefined {
  return JSON.stringify(code, null, 4);
}

function parseMessage(message: unknown): string {
  if (message == null) {
    return '<empty>';
  }
  if (message instanceof CustomAiError) {
    return String(message);
  }
  if (message instanceof Error) {
    return message.stack || message.message || String(message);
  }
  if (typeof message === 'object') {
    // ? Java exceptions surface as objects; their toString() is more useful than JSON.stringify
    const text = String(message);
    if (text !== '[object Object]') {
      return text;
    }
    return stringifyCode(message) || text;
  }
  return String(message);
}

export const logInfo = (message: unknown): void => log.info(parseMessage(message));
export const logWarn = (message: unknown): void => log.warning(parseMessage(message));
export const logError = (message: unknown): void => log.error(parseMessage(message));
export const logDebug = (
  group: Omit<LogDebugGroups, LogDebugGroups.ALL>,
  message: unknown,
): void => {
  const canDebug =
    DEBUG_GROUPS.length === 0 ||
    DEBUG_GROUPS.indexOf(LogDebugGroups.NONE) < 0 ||
    DEBUG_GROUPS.indexOf(LogDebugGroups.ALL) >= 0 ||
    DEBUG_GROUPS.indexOf(group as string) >= 0;
  if (canDebug) {
    log.debug(parseMessage(message));
  }
};
