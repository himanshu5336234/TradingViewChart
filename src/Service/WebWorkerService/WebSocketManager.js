import { webSocketWorkerURL } from "./WebSocketWorker";

class WebSocketManager {
  static instance = null;
  worker = null;
  listeners = new Map();

  constructor() {
    if (WebSocketManager.instance) {
      return WebSocketManager.instance;
    }

    this.worker = new Worker(webSocketWorkerURL);
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
    
    WebSocketManager.instance = this;
  }

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  init(url) {
    this.worker.postMessage({ type: 'INIT', payload: url });
  }

  send(message) {
    this.worker.postMessage({ type: 'SEND', payload: message });
  }

  addEventListener(eventType, callback) {
    // console.log(eventType, callback,"eventType, callback")
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  removeEventListener(eventType, callback) {
 
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  handleAppStateChange(state) {
    this.worker.postMessage({ type: 'APP_STATE_CHANGE', payload: state });
  }

  disconnect() {
    this.worker.postMessage({ type: 'DISCONNECT' });
  }

  handleWorkerMessage(event) {
    const { type, payload } = event.data;
    // console.log(event.data,"event.data")
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type);
      callbacks.forEach(callback => callback(payload));
    }
  }

  terminate() {
    this.disconnect();
    this.worker.terminate();
    this.listeners.clear();
    WebSocketManager.instance = null;
  }
}

export default WebSocketManager;