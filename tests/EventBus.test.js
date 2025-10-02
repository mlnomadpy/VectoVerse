import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../modules/EventBus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on', () => {
    it('should register an event listener', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);
      expect(eventBus.listeners['test-event']).toHaveLength(1);
      expect(eventBus.listeners['test-event'][0]).toBe(callback);
    });

    it('should register multiple listeners for the same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      expect(eventBus.listeners['test-event']).toHaveLength(2);
    });

    it('should register listeners for different events', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      eventBus.on('event1', callback1);
      eventBus.on('event2', callback2);
      expect(eventBus.listeners['event1']).toHaveLength(1);
      expect(eventBus.listeners['event2']).toHaveLength(1);
    });
  });

  describe('off', () => {
    it('should remove a specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      
      eventBus.off('test-event', callback1);
      expect(eventBus.listeners['test-event']).toHaveLength(1);
      expect(eventBus.listeners['test-event'][0]).toBe(callback2);
    });

    it('should handle removing non-existent listener gracefully', () => {
      const callback = vi.fn();
      eventBus.off('non-existent', callback);
      expect(eventBus.listeners['non-existent']).toBeUndefined();
    });

    it('should handle removing from non-existent event', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);
      eventBus.off('different-event', callback);
      expect(eventBus.listeners['test-event']).toHaveLength(1);
    });

    it('should remove all instances of the callback', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);
      eventBus.on('test-event', callback);
      
      eventBus.off('test-event', callback);
      expect(eventBus.listeners['test-event']).toHaveLength(0);
    });
  });

  describe('emit', () => {
    it('should call all registered listeners with data', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const testData = { message: 'test' };
      
      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      eventBus.emit('test-event', testData);
      
      expect(callback1).toHaveBeenCalledWith(testData);
      expect(callback2).toHaveBeenCalledWith(testData);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should handle emitting event with no listeners', () => {
      expect(() => eventBus.emit('non-existent', {})).not.toThrow();
    });

    it('should call listeners with undefined data when no data provided', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);
      eventBus.emit('test-event');
      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it('should call listeners in the order they were registered', () => {
      const order = [];
      const callback1 = vi.fn(() => order.push(1));
      const callback2 = vi.fn(() => order.push(2));
      const callback3 = vi.fn(() => order.push(3));
      
      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      eventBus.on('test-event', callback3);
      eventBus.emit('test-event');
      
      expect(order).toEqual([1, 2, 3]);
    });

    it('should handle complex data objects', () => {
      const callback = vi.fn();
      const complexData = {
        nested: { value: 42 },
        array: [1, 2, 3],
        string: 'test'
      };
      
      eventBus.on('test-event', callback);
      eventBus.emit('test-event', complexData);
      
      expect(callback).toHaveBeenCalledWith(complexData);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple events independently', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('event1', callback1);
      eventBus.on('event2', callback2);
      
      eventBus.emit('event1', { data: 1 });
      eventBus.emit('event2', { data: 2 });
      
      expect(callback1).toHaveBeenCalledWith({ data: 1 });
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith({ data: 2 });
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should allow removing listener during execution', () => {
      let callback2;
      const callback1 = vi.fn(() => {
        eventBus.off('test-event', callback2);
      });
      callback2 = vi.fn();
      
      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);
      
      eventBus.emit('test-event');
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      
      eventBus.emit('test-event');
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });
});
