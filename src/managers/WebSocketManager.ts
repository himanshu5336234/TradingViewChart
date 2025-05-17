import { getBaseURL } from '@services/ApiService/baseUrl';
import { webSocketWorkerURL } from '@services/WebWorkerService/WebSocketWorker';

type WebSocketMessageType = 'INIT' | 'SEND' | 'APP_STATE_CHANGE' | 'DISCONNECT' | string;

interface WorkerMessage {
  type: WebSocketMessageType;
  payload?: any;
}

type ListenerCallback = (payload: any) => void;

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private worker: Worker;
  private listeners: Map<string, Set<ListenerCallback>> = new Map();

  private constructor() {
    this.worker = new Worker(webSocketWorkerURL);
    this.worker.onmessage = this.handleWorkerMessage.bind(this);

    // Auto-initialize WebSocket connection with URL from query param
    const { binanceWsBase } = getBaseURL();
    this.worker.postMessage({ type: 'INIT', payload: binanceWsBase });
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  send(message: any): void {
    this.worker.postMessage({ type: 'SEND', payload: message });
  }

  addEventListener(eventType: string, callback: ListenerCallback): void {
    debugger
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  removeEventListener(eventType: string, callback: ListenerCallback): void {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType)!;
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  handleAppStateChange(state: any): void {
    this.worker.postMessage({ type: 'APP_STATE_CHANGE', payload: state });
  }

  disconnect(): void {
    this.worker.postMessage({ type: 'DISCONNECT' });
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data as WorkerMessage;
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type)!;
      callbacks.forEach(callback => callback(payload));
    }
  }

  terminate(): void {
    this.disconnect();
    this.worker.terminate();
    this.listeners.clear();
    WebSocketManager.instance = null;
  }
}

export default WebSocketManager;
