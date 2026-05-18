export type WebSocketStore = {
  state: 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
  connection: Optional<WebSocket>;
  success: boolean;
};
