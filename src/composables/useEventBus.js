import { ref } from 'vue';

const bus = ref(new Map());

export function useEventBus() {
  const on = (event, callback) => {
    if (!bus.value.has(event)) {
      bus.value.set(event, []);
    }
    bus.value.get(event).push(callback);
  };

  const off = (event, callback) => {
    if (bus.value.has(event)) {
      const callbacks = bus.value.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  };

  const emit = (event, ...args) => {
    if (bus.value.has(event)) {
      bus.value.get(event).forEach(callback => {
        callback(...args);
      });
    }
  };

  return { on, off, emit };
} 