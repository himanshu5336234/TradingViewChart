import { PING_INTERVAL } from "./constants";

export class ConnectionManager {
    constructor(webSocketManager, url) {
      this.webSocketManager = webSocketManager;
      this.url = url;
      this.isConnected = false;
      this.pingInterval = null;
    }
  
    connect() {
      this.webSocketManager.init(this.url);
    }
  
    setupEventHandlers(messageHandler, subscriptionManager) {
      this.webSocketManager.addEventListener('open', () => this.handleOpen(subscriptionManager));
      this.webSocketManager.addEventListener('WebSocketClosed', () => this.handleClose());
      this.webSocketManager.addEventListener('WebSocketError', (error) => this.handleError(error));
      this.webSocketManager.addEventListener('WebSocketMessage', (msg) => messageHandler.processMessage(msg));
    }
  
    handleOpen(subscriptionManager) {
      console.log('[WebSocket] Connected');
      this.isConnected = true;
  
      if (subscriptionManager.storeLastSub) {
        this.webSocketManager.send(subscriptionManager.storeLastSub);
      }
  
      this.startPingInterval();
    }
  
    handleClose() {
      console.log('[WebSocket] Disconnected');
      this.isConnected = false;
      this.clearPingInterval();
      setTimeout(() => this.connect(), RECONNECT_DELAY);
    }
  
    handleError(error) {
      console.error('[WebSocket] Error:', error);
    }
  
    startPingInterval() {
      this.pingInterval = setInterval(() => {
        this.webSocketManager.send(JSON.stringify({
          method: "PING",
          params: ["PING"],
          id: Date.now()
        }));
      }, PING_INTERVAL);
    }
  
    clearPingInterval() {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    }
  }