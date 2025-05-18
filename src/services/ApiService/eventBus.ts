export interface EventMap {
  'user:login': { userId: string };
  'chat:message': { text: string; sender: string };
  'app:error': { code: number; message: string };
}

type Callback<T = any> = (data: T) => void;

export class PusSubEvent {
  private events: { [K in keyof EventMap]?: Callback<EventMap[K]>[] } = {};

  subscribe<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
  }

  unsubscribe<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter(cb => cb !== callback) as Callback<EventMap[K]>[];
    if (this.events[event]!.length === 0) {
      delete this.events[event];
    }
  }

  subscribeOnce<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
    const wrapper = (data: EventMap[K]) => {
      callback(data);
      this.unsubscribe(event, wrapper);
    };
    this.subscribe(event, wrapper);
  }

  publish<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const callbacks = this.events[event]?.slice(); // Avoid mutation during emit
    if (!callbacks) return;
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`EventBus error in ${String(event)}:`, err);
      }
    });
  }

  clearAll(): void {
    this.events = {};
  }
}

export const eventBus = new PusSubEvent();