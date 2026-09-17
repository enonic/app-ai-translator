import { toKey } from '@shared/ai-field-path';
import { WS_PROTOCOL } from '@shared/constants';
import { ERRORS } from '@shared/errors';
import {
  MessageType,
  type ClientMessage,
  type MessageMetadata,
  type ServerMessage,
} from '@shared/types/websocket';
import { t } from 'i18next';

import { $config } from '@/store/config';
import { $content, getLanguage } from '@/store/content';
import { $dialog, $instructions, setDialogView } from '@/store/dialog';
import { getHostApi } from '@/store/host';
import {
  $items,
  $itemsState,
  addFailed,
  addSucceeded,
  resetItems,
  setGlobalFailure,
  setPaths,
  skipRemaining,
} from '@/store/items';

import type { AiFieldPath, AiFieldsResult, AiTranslateRequest } from '@shared/ai-protocol';

import { $translating, $websocket } from './websocket.store';

export function startTranslation(): void {
  const contentId = $content.get().persisted?.contentId;
  const project = $content.get().persisted?.project;

  if ($translating.get() || !contentId || !project) {
    return;
  }

  const { tag, name } = getLanguage();
  translateInto(contentId, project, `${tag} (${name})`);
}

function translateInto(contentId: string, project: string, targetLanguage: string): void {
  resetItems();

  const customInstructions = $instructions.get();

  connect();

  const unsubscribe = $websocket.subscribe(({ state }) => {
    if (state === 'connected') {
      requestTranslation(contentId, project, targetLanguage, customInstructions);
      unsubscribe();
    }
  });
}

//
//* Headless translation (voice)
//
// Content Studio's voice assistant asks for a translation without the dialog:
// the same server flow runs, only the requested fields are applied (all when
// none are named) and the outcome is reported back through the host API.

type HeadlessRequest = {
  requestId: string;
  requested: AiFieldPath[] | null;
  only: Set<string> | null;
  notAccepted: AiFieldPath[];
};

let headless: HeadlessRequest | null = null;

export function startHeadlessTranslation(request: AiTranslateRequest): void {
  const api = getHostApi();
  const contentId = $content.get().persisted?.contentId;
  const project = $content.get().persisted?.project;
  const paths = request.paths ?? [];

  if ($translating.get() || headless != null || !contentId || !project) {
    api.reportResult({
      requestId: request.requestId,
      applied: [],
      failed: paths.map((path) => ({ path, message: 'busy' })),
    });
    return;
  }

  console.info(
    '[ai.translator] voice request',
    request.requestId,
    request.language.tag,
    paths.length || 'all',
  );
  headless = {
    requestId: request.requestId,
    requested: request.paths ?? null,
    only: request.paths ? new Set(request.paths.map(toKey)) : null,
    notAccepted: [],
  };
  translateInto(contentId, project, `${request.language.tag} (${request.language.name})`);
}

function isRequested(path: AiFieldPath): boolean {
  return headless?.only == null || headless.only.has(toKey(path));
}

function finishHeadless(): void {
  const request = headless;
  if (request == null) {
    return;
  }
  headless = null;
  const { succeeded, failed } = $items.get();
  const result: AiFieldsResult = {
    requestId: request.requestId,
    applied: succeeded,
    failed: [
      ...failed.map(({ path, reason }) => ({ path, message: reason })),
      ...request.notAccepted.map((path) => ({ path, message: 'not translatable' })),
    ],
  };
  console.info(
    '[ai.translator] voice result',
    result.applied.length,
    'applied,',
    result.failed.length,
    'failed',
  );
  getHostApi().reportResult(result);
}

//
//* Connection
//

const PING_INTERVAL = 50000; // ms
let pingIntervalId: number;

const ABORT_TIMEOUT = 30000; // ms
let abortTimeoutId: number;

function abortOnNextLongRunningTask(): void {
  clearTimeout(abortTimeoutId);
  abortTimeoutId = window.setTimeout(() => {
    failGlobally(t('text.error.client.longRunningTask'));
  }, ABORT_TIMEOUT);
}

function connect(): void {
  const { wsServiceUrl } = $config.get();
  const ws = new WebSocket(wsServiceUrl, [WS_PROTOCOL]);

  ws.onopen = () => {
    $websocket.setKey('connection', ws);
    $websocket.setKey('state', 'connecting');

    sendMessage({
      type: MessageType.CONNECT,
      metadata: createMetadata(),
    });

    pingIntervalId = window.setInterval(() => {
      sendMessage({
        type: MessageType.PING,
        metadata: createMetadata(),
      });
    }, PING_INTERVAL);
  };

  ws.onmessage = handleMessage;

  ws.onerror = closeConnection;

  ws.onclose = cleanup;
}

function closeConnection(): void {
  const { connection } = $websocket.get();
  if (connection?.readyState === WebSocket.OPEN) {
    $websocket.setKey('state', 'disconnecting');
    sendMessage({
      type: MessageType.DISCONNECT,
      metadata: createMetadata(),
    });
    connection.close();
  }
  cleanup();
}

function cleanup(): void {
  clearInterval(pingIntervalId);
  clearTimeout(abortTimeoutId);
  $websocket.set({
    state: 'disconnected',
    connection: null,
    success: true,
  });
}

//
//* Receive
//

function handleMessage(event: MessageEvent<string>): void {
  const msg = JSON.parse(event.data) as ServerMessage;

  switch (msg.type) {
    case MessageType.CONNECTED:
      $websocket.setKey('state', 'connected');
      break;

    case MessageType.ACCEPTED: {
      const accepted = msg.payload.paths;
      const paths = accepted.filter(isRequested);
      if (headless?.requested != null) {
        const acceptedKeys = new Set(accepted.map(toKey));
        headless.notAccepted = headless.requested.filter((path) => !acceptedKeys.has(toKey(path)));
      }
      setPaths(paths);
      if (paths.length === 0) {
        if (headless != null) {
          finishHeadless();
        } else {
          setDialogView('completed');
        }
        closeConnection();
        break;
      }
      paths.forEach((path) => {
        getHostApi().setFieldState(path, 'processing');
      });
      abortOnNextLongRunningTask();
      break;
    }

    case MessageType.COMPLETED: {
      const { path, text } = msg.payload;
      if (!isRequested(path)) {
        break;
      }
      addSucceeded(path);
      getHostApi().setFieldState(path, 'completed', { text });
      getHostApi().applyValue(path, text);
      abortOnNextLongRunningTask();
      break;
    }

    case MessageType.FAILED: {
      const { code, path } = msg.payload;
      const message = getErrorMessageByCode(Number(code));

      console.error(`AI <${code}> error: ${msg.payload.message}`);

      if (path) {
        if (isRequested(path)) {
          addFailed(path, message);
          getHostApi().setFieldState(path, 'failed', { message });
        }
        abortOnNextLongRunningTask();
      } else {
        failGlobally(message);
      }
      break;
    }

    case MessageType.DISCONNECTED:
      cleanup();
      break;
  }
}

function failGlobally(message: string): void {
  const remaining = [...$items.get().remaining];
  $websocket.setKey('success', false);
  setGlobalFailure(message);
  remaining.forEach((path) => getHostApi().setFieldState(path, 'failed', { message }));
  getHostApi().notify('error', message);
  closeConnection();
}

export function stopTranslation(): void {
  const { remaining } = $items.get();

  remaining.forEach((path) => getHostApi().setFieldState(path, 'completed'));
  skipRemaining();

  closeConnection();
}

//
//* Send
//

function createMetadata(): MessageMetadata {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
}

function sendMessage(message: ClientMessage): void {
  const { connection } = $websocket.get();
  if (connection?.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify(message));
  }
}

function requestTranslation(
  contentId: string,
  project: string,
  targetLanguage: string,
  customInstructions?: string,
): void {
  sendMessage({
    type: MessageType.TRANSLATE,
    metadata: createMetadata(),
    payload: {
      contentId,
      project,
      targetLanguage,
      customInstructions,
    },
  });
}

function getErrorMessageByCode(code: number): string {
  switch (code) {
    case ERRORS.GOOGLE_SAK_MISSING.code:
    case ERRORS.GOOGLE_SAK_READ_FAILED.code:
    case ERRORS.GOOGLE_ACCESS_TOKEN_MISSING.code:
    case ERRORS.GOOGLE_PROJECT_ID_MISSING.code:
      return t('text.error.configuration');
    case ERRORS.WS_INVALID_PROTOCOL.code:
      return t('text.error.websocket.protocol');
    case ERRORS.QUERY_CONTENT_NOT_FOUND.code:
    case ERRORS.QUERY_CONTENT_TYPE_NOT_FOUND.code:
      return t('text.error.query.notFound');
    case ERRORS.FUNC_INSUFFICIENT_DATA.code:
    case ERRORS.FUNC_UNKNOWN_MODE.code:
      return t('text.error.function');
    case ERRORS.FUNC_TRANSLATION_EMPTY.code:
      return t('text.error.function.translationEmpty');
    case ERRORS.MODEL_SAFETY.code:
      return t('text.error.model.safety');
    case ERRORS.MODEL_PROHIBITED_CONTENT.code:
      return t('text.error.model.prohibitedContent');
    case ERRORS.MODEL_SPII.code:
      return t('text.error.model.spii');
    case ERRORS.MODEL_UNKNOWN_ERROR.code:
    case ERRORS.MODEL_INVALID_ARGUMENT.code:
    case ERRORS.MODEL_FAILED_PRECONDITION.code:
      return t('text.error.model', { code });
    case ERRORS.GOOGLE_BLOCKED.code:
      return t('text.error.response.safety');
    case ERRORS.GOOGLE_REQUEST_FAILED.code:
      return t('text.error.google.request');
    case ERRORS.GOOGLE_RESPONSE_PARSE_FAILED.code:
      return t('text.error.google.parse');
    case ERRORS.GOOGLE_CANDIDATES_EMPTY.code:
      return t('text.error.google.empty');
    case ERRORS.LICENSE_ERROR_MISSING.code:
      return t('text.error.license.invalid');
    case ERRORS.LICENSE_ERROR_EXPIRED.code:
      return t('text.error.license.expired');
    default:
      return t('text.error.unknown', { code });
  }
}

//
//* Completion
//

let completeTimeoutId: number;

$itemsState.subscribe((state) => {
  if (headless != null && (state === 'completed' || state === 'failed')) {
    if (state === 'completed') {
      getHostApi().requestSave();
    }
    finishHeadless();
    stopTranslation();
    return;
  }

  const { view } = $dialog.get();

  if ((state === 'completed' || state === 'failed') && view === 'processing') {
    clearTimeout(completeTimeoutId);

    if (state === 'completed') {
      getHostApi().requestSave();
      completeTimeoutId = window.setTimeout(() => {
        setDialogView('completed');
        stopTranslation();
      }, 500);
    } else {
      // Failure already surfaced per-path / globally — do not double-notify.
      setDialogView('completed');
      stopTranslation();
    }
  }
});
