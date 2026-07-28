import cron from '/lib/cron';
import * as websocketLib from '/lib/xp/websocket';

import type { TranslatableEntry } from '../../lib/content/content';
import type { AiFieldPath } from '../../shared/ai-protocol';
import type {
  AcceptedMessage,
  ClientMessage,
  CompletedMessage,
  FailedMessage,
  MessageMetadata,
  ServerMessage,
  TranslateMessage,
} from '../../shared/types/websocket';

import { getTranslatableDataFromContent } from '../../lib/content/content';
import * as licenseManager from '../../lib/license/licenseManager';
import { logDebug, LogDebugGroups, logError } from '../../lib/logger';
import { respondError } from '../../lib/requests';
import { translateFields } from '../../lib/translate/enqueue';
import { clearSession, drainOutcomes } from '../../lib/translate/results';
import { runAsAdmin } from '../../lib/utils/context';
import { unsafeUUIDv4 } from '../../lib/utils/uuid';
import { WS_PROTOCOL } from '../../shared/constants';
import { ERRORS } from '../../shared/errors';
import { MessageType } from '../../shared/types/websocket';

export function get(request: Enonic.Request): Enonic.Response {
  if (!request.webSocket) {
    const error = ERRORS.REST_NOT_FOUND.withMsg(
      'Trying to access WebSocket with "webSocket" set to "false"',
    );
    return respondError(error, 404);
  }

  const protocols = request.headers?.['Sec-WebSocket-Protocol']?.split(', ');
  const isValidProtocol = protocols?.some((protocol) => protocol === WS_PROTOCOL);
  if (!isValidProtocol) {
    const error = ERRORS.WS_INVALID_PROTOCOL.withMsg('Invalid WebSocket protocol');
    return respondError(error, 400);
  }

  return {
    status: 101,
    webSocket: {
      subProtocols: [WS_PROTOCOL],
    },
  };
}

export function webSocketEvent(event: Enonic.WebSocketEvent): void {
  try {
    const { type } = event;

    switch (type) {
      case 'open':
        break;
      case 'message':
        handleMessage(event);
        break;
      case 'close':
        handleClose(event);
        break;
      case 'error':
        logError(`ws.error: session=${event.session.id}`);
        break;
    }
  } catch (e) {
    logError('webSocketEvent failed:');
    logError(e);
  }
}

function handleMessage(event: Enonic.WebSocketEvent): void {
  const { id } = event.session;

  const message = parseMessage(event.message);
  if (!message) {
    return;
  }

  logDebug(LogDebugGroups.WS, `Received message: ${JSON.stringify(message)}`);

  switch (message.type) {
    case MessageType.PING:
      sendMessage(id, { type: MessageType.PONG });
      break;
    case MessageType.CONNECT:
      sendMessage(id, { type: MessageType.CONNECTED });
      break;
    case MessageType.TRANSLATE:
      startTranslation(event.session, message);
      break;
  }
}

function parseMessage(message: Optional<string>): Optional<ClientMessage> {
  try {
    return message != null ? (JSON.parse(message) as ClientMessage) : undefined;
  } catch (_e) {
    return undefined;
  }
}

function createMetadata(): MessageMetadata {
  return {
    id: unsafeUUIDv4(),
    timestamp: Date.now(),
  };
}

function sendMessage(id: string, message: Omit<ServerMessage, 'metadata'>): void {
  websocketLib.send(id, JSON.stringify({ ...message, metadata: createMetadata() }));
}

function startTranslation(session: Enonic.WebSocketSession, message: TranslateMessage): void {
  const { contentId, project, targetLanguage, customInstructions } = message.payload;
  const [licenseState, licenseError] = licenseManager.getLicenseState();

  if (licenseError) {
    sendMessage(session.id, makeFailedMessage(licenseError, contentId));
    return;
  }

  if (licenseState !== 'OK') {
    const error =
      licenseState === 'EXPIRED' ? ERRORS.LICENSE_ERROR_EXPIRED : ERRORS.LICENSE_ERROR_MISSING;
    const msg = makeFailedMessage(error, contentId);
    sendMessage(session.id, msg);
    return;
  }

  const [fields, err] = getTranslatableDataFromContent(contentId, project, session.user);

  if (err) {
    sendMessage(session.id, makeFailedMessage(err, contentId));
    return;
  }

  sendMessage(session.id, makeAcceptedMessage(contentId, fields));

  if (fields.length === 0) {
    return;
  }

  // ! One poll loop per session is the sole sender: outbound ws sends to a connection must stay
  // serialized to avoid a ws backend error (XP-10759). cron.schedule returns without blocking.
  pollAndSendMessages(session.id, contentId);

  try {
    translateFields(
      {
        fields,
        contentId,
        project,
        targetLanguage,
        customInstructions,
      },
      session.id,
    );
  } catch (e) {
    const msg = makeFailedMessage(
      ERRORS.UNKNOWN_ERROR.withMsg(`Failed to translate: ${contentId}`),
      contentId,
    );
    sendMessage(session.id, msg);
    logError(`startTranslation: translateFields threw for contentId=${contentId}`);
    logError(e);
  }
}

function makeAcceptedMessage(
  contentId: string,
  itemsToTranslate: TranslatableEntry[],
): Omit<AcceptedMessage, 'metadata'> {
  return {
    type: MessageType.ACCEPTED,
    payload: {
      contentId,
      paths: itemsToTranslate.map((entry: TranslatableEntry): AiFieldPath => entry.path),
    },
  };
}

function makeCompletedMessage(
  contentId: string,
  path: AiFieldPath,
  text: string,
): Omit<CompletedMessage, 'metadata'> {
  return {
    type: MessageType.COMPLETED,
    payload: {
      contentId,
      text,
      path: path,
    },
  };
}

function makeFailedMessage(
  err: AiError,
  contentId: string,
  path?: AiFieldPath,
): Omit<FailedMessage, 'metadata'> {
  return {
    type: MessageType.FAILED,
    payload: {
      contentId,
      path: path,
      message: err.message,
      code: err.code?.toString(),
    },
  };
}

function pollAndSendMessages(sessionId: string, contentId: string): void {
  const taskName = getTaskName(sessionId);
  try {
    // ! lib-cron 2.0 on XP 8 reads the current Jetty request at schedule() time; run inside an XP context so it doesn't NPE on WS/task threads
    runAsAdmin(() => {
      cron.schedule({
        name: taskName,
        fixedDelay: 500,
        delay: 1000,
        times: 960, // 500ms * 960 = 480s, run for 8 minutes
        callback: () => {
          try {
            drainOutcomes(sessionId, (outcome) => {
              if (outcome.status === 'completed') {
                sendMessage(sessionId, makeCompletedMessage(contentId, outcome.path, outcome.text));
              } else {
                sendMessage(
                  sessionId,
                  makeFailedMessage(
                    { code: outcome.code, message: outcome.message },
                    contentId,
                    outcome.path,
                  ),
                );
              }
            });
          } catch (e) {
            logError(`pollAndSendMessages.tick failed for session=${sessionId}:`);
            logError(e);
          }
        },
      });
    });
  } catch (e) {
    logError(`pollAndSendMessages: cron.schedule threw for '${taskName}':`);
    logError(e);
  }
}

function handleClose(event: Enonic.WebSocketEvent): void {
  const sessionId = event.session.id;
  const taskName = getTaskName(sessionId);
  try {
    runAsAdmin(() => cron.unschedule({ name: taskName }));
  } catch (e) {
    logError(`handleClose: cron.unschedule threw for '${taskName}':`);
    logError(e);
  } finally {
    clearSession(sessionId);
  }
}

function getTaskName(sessionId: string): string {
  return `send-ws-messages-${sessionId}`;
}
