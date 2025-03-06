export class EventEmitter {
    events = new Map();
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }
    emit(event, ...args) {
        if (!this.events.has(event))
            return;
        for (const callback of this.events.get(event)) {
            callback(...args);
        }
    }
    off(event, callback) {
        if (!callback) {
            this.events.delete(event);
            return;
        }
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            this.events.set(event, callbacks.filter((cb) => cb !== callback));
        }
    }
}
//# sourceMappingURL=EventEmitter.mjs.map