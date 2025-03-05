export type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  public on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) return;

    for (const callback of this.events.get(event)!) {
      callback(...args);
    }
  }

  public off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.events.delete(event);
      return;
    }

    if (this.events.has(event)) {
      const callbacks = this.events.get(event)!;
      this.events.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    }
  }
}
