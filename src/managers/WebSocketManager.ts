import { getBaseURL } from '@services/ApiService/baseUrl';
import { webSocketWorkerURL } from '@services/WebWorkerService/WebSocketWorker';

type WebSocketMessageType = 'INIT' | 'SEND' | 'APP_STATE_CHANGE' | 'DISCONNECT' | string;

interface WorkerMessage {
  type: WebSocketMessageType;
  payload?: unknown;
}

type ListenerCallback = (payload: unknown) => void;

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private worker: Worker;
  private listeners: Record<string, ListenerCallback[]> = {};
  private isConnected: boolean = false;
  private constructor(url: string) {
    this.worker = new Worker(webSocketWorkerURL);
    this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      this.handleWorkerMessage(event);
    };
    this.worker.postMessage({ type: 'INIT', payload: url });
    // window.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      const { binanceWsBase } = getBaseURL();
      WebSocketManager.instance = new WebSocketManager(binanceWsBase);
    }
    return WebSocketManager.instance;
  }

                 send(message: unknown): void {
    this.worker?.postMessage({ type: 'SEND', payload: message });
  }
  reconnect(): void {
    const { binanceWsBase } = getBaseURL();
    this.worker?.postMessage({ type: 'INIT', payload: binanceWsBase });
  }

  public addListener(event: string, listener: ListenerCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  public removeListener(event: string, listener: ListenerCallback): void {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(listener);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const { type, payload } = event.data;
  
    if (type === 'CONNECTED') {
      this.isConnected = true;
    } else if (type === 'DISCONNECTED') {
      this.isConnected = false;
    }
  
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => listener(payload));
    }
  }
  
  private handleVisibilityChange = (): void => {
    const nextAppState = document.hidden ? 'inactive' : 'active';
    console.log(nextAppState, "nextAppState");
    this.worker?.postMessage({ type: 'APP_STATE_CHANGE', payload: nextAppState });
  };

  public handleAppStateChange(state: string): void {
    this.worker?.postMessage({ type: 'APP_STATE_CHANGE', payload: state });
  }

  public disconnect(): void {
    this.worker?.postMessage({ type: 'DISCONNECT' });
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public removeAllListeners(): void {
    this.listeners = {};
  }
  public get connectionStatus(): boolean {
    return this.isConnected;
  }
  public terminate(): void {
    this.disconnect();
    this.worker.terminate();
    this.listeners = {};
    WebSocketManager.instance = null;
  }
}

export default WebSocketManager;
