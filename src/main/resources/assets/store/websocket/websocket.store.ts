import { computed, map } from 'nanostores';

import type { WebSocketStore } from './websocket.types';

export const $websocket = map<WebSocketStore>({
  state: 'disconnected',
  connection: null,
  success: true,
});

export const $translating = computed($websocket, ({ connection }) => connection != null);
