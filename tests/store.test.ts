import { describe, it, expect, beforeEach, vi } from 'vitest';
import Statety, { INTERNAL } from '../src/store';

describe('Statety Core Store', () => {
  describe('create', () => {
    it('should create a new state key with default value', () => {
      const key = Statety.create<number>('test', 2);
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('symbol');
      
      const value = Statety.read(key);
      expect(value).toBe(2);
    });

    it('should create a key with null default value', () => {
      const key = Statety.create<string>('test-string');
      
      const value = Statety.read(key);
      expect(value).toBe(null);
    });

    it('should create unique keys even with same name', () => {
      const key1 = Statety.create<number>('same-name', 1);
      const key2 = Statety.create<number>('same-name', 2);
      
      expect(key1).not.toBe(key2);
      
      expect(Statety.read(key1)).toBe(1);
      expect(Statety.read(key2)).toBe(2);
    });

    it('should deep clone the default value', () => {
      const originalObject = { age: 20, name: 'John', abc: { def: 'ghi' } };
      const key = Statety.create<{ age: number; name: string }>('test-set', originalObject);
      originalObject.age = 21;
      originalObject.name = 'Jane';
      originalObject.abc.def = 'jkl';

      expect(Statety.read(key)).toStrictEqual({ age: 20, name: 'John', abc: { def: 'ghi' } });
    });
  });

  describe('derive', () => {
    it('should create a new derived state key', () => {
      const key = Statety.create<number>('test', 42);
      const derivedKey = Statety.derive('test-derive', key, (state) => state !== null ? state + 1 : null);
      
      expect(Statety.read(derivedKey)).toBe(43);
    });

    it('should work with a derived key as a source key', () => {
        const key = Statety.create<number>('test', 42);
        const derivedKey = Statety.derive('test-derive', key, (state) => state !== null ? state + 1 : null);
        const derivedKey2 = Statety.derive('test-derive2', derivedKey, (state) => state !== null ? state + 1 : null);

        expect(Statety.read(derivedKey)).toBe(43);
        expect(Statety.read(derivedKey2)).toBe(44);

        Statety.set(key, 43);
        expect(Statety.read(derivedKey)).toBe(44);
        expect(Statety.read(derivedKey2)).toBe(45);

        Statety.set(key, 44);
        expect(Statety.read(derivedKey)).toBe(45);
        expect(Statety.read(derivedKey2)).toBe(46);
    });

    it('should work with a computed key as a source key', () => {
        const key = Statety.create<number>('test', 42);
        const computedKey = Statety.compute('test-computed', [key], (state) => state !== null ? (state[0] ?? 0) + 1 : 0);
        const derivedKey = Statety.derive('test-derive', computedKey, (state) => state !== null ? state + 1 : null);

        expect(Statety.read(derivedKey)).toBe(44);

        Statety.set(key, 43);
        expect(Statety.read(derivedKey)).toBe(45);

        Statety.set(key, 44);
        expect(Statety.read(derivedKey)).toBe(46);
    });

    it('should run the compute function when the source key changes', () => {
        const key = Statety.create<number>('test', 42);
        const derivedKey = Statety.derive('test-derive', key, (state) => state !== null ? state + 1 : null);
        expect(Statety.read(derivedKey)).toBe(43);

        Statety.set(key, 43);
        expect(Statety.read(derivedKey)).toBe(44);

        Statety.set(key, 44);
        expect(Statety.read(derivedKey)).toBe(45);

        Statety.set(key, 45);
        expect(Statety.read(derivedKey)).toBe(46);
    });

    it('should provide a snapshot of the parameter state', () => {
        const key = Statety.create<{
            age: number;
            name: string;
        }>('test', { age: 20, name: 'John' });
        const derivedKey = Statety.derive('test-derive', key, (state) => {
            state!.age = state!.age + 1;
            state!.name = 'Jane';

            return state;
        });

        expect(Statety.read(derivedKey)).toStrictEqual({ age: 21, name: 'Jane' });
        expect(Statety.read(key)).toStrictEqual({ age: 20, name: 'John' });
    });

  });

  describe('compute', () => {
    it('should create a new computed state key', () => {
      const key = Statety.create<number>('test', 42);
      const computedKey = Statety.compute('test-computed', [key], (state) => {
        return state !== null ? (state[0] ?? 0) + 1 : 0;
      });
      
      expect(Statety.read(computedKey)).toBe(43);
    });

    it('should work with multiple state keys', () => {
        const key = Statety.create<number>('test', 1);
        const key2 = Statety.create<number>('test2', 1);
        const computedKey = Statety.compute('test-computed', [key, key2], (state) => state !== null ? (state[0] ?? 0) + (state[1] ?? 0) : 0);
        
        expect(Statety.read(computedKey)).toBe(2);

        Statety.set(key, 2);
        expect(Statety.read(computedKey)).toBe(3);

        Statety.set(key2, 2);
        expect(Statety.read(computedKey)).toBe(4);

        Statety.set(key, 5);
        Statety.set(key2, 2);
        expect(Statety.read(computedKey)).toBe(7);
    });

    it('should work with a derived state key', () => {
        const key = Statety.create<number>('test', 1);
        const key2 = Statety.create<number>('test2', 1);
        const derivedKey = Statety.derive('test-derived-double', key, (state) => state !== null ? state * 2 : 0);
        const computedKey = Statety.compute('test-computed', [key, key2, derivedKey], (state) => state !== null ? (state[0] ?? 0) + (state[1] ?? 0) + (state[2] ?? 0) : 0);
        
        expect(Statety.read(computedKey)).toBe(4);

        Statety.set(key, 2);
        expect(Statety.read(computedKey)).toBe(7);

        Statety.set(key2, 2);
        expect(Statety.read(computedKey)).toBe(8);

        Statety.set(key, 5);
        Statety.set(key2, 2);
        expect(Statety.read(computedKey)).toBe(17);
    });

    it('should work with a computed state key', () => {
        const key = Statety.create<number>('test', 1);
        const key2 = Statety.create<number>('test2', 1);
        const computedKey = Statety.compute('test-computed', [key, key2], (state) => state !== null ? (state[0] ?? 0) * (state[1] ?? 0) : 0);
        const computedKey2 = Statety.compute('test-computed2', [computedKey, key2], (state) => state !== null ? (state[0] ?? 0) + (state[1] ?? 0) : 0);
        
        expect(Statety.read(computedKey2)).toBe(2);

        Statety.set(key, 2);
        expect(Statety.read(computedKey2)).toBe(3);

        Statety.set(key2, 2);
        expect(Statety.read(computedKey2)).toBe(6);

        Statety.set(key, 5);
        Statety.set(key2, 2);
        expect(Statety.read(computedKey2)).toBe(12);
    });

    it('should work with all state keys combined', () => {
        const key = Statety.create<number>('test', 1);
        const key2 = Statety.create<number>('test2', 1);
        const derivedDoubleKey = Statety.derive('test-derived-double', key, (state) => state !== null ? state * 2 : 0);
        const computedSumKey = Statety.compute('test-computed', [key, key2, derivedDoubleKey], (state) => state !== null ? (state[0] ?? 0) + (state[1] ?? 0) + (state[2] ?? 0) : 0);
        const computedKey2 = Statety.compute('test-computed2', [computedSumKey, derivedDoubleKey, key], (state) =>  {
            return state !== null ? (state[0] ?? 0) + (state[1] ?? 0) + (state[2] ?? 0) : 0;
        });

        expect(Statety.read(computedKey2)).toBe(7);

        Statety.set(key, 2);
        expect(Statety.read(computedKey2)).toBe(13);

        Statety.set(key2, 2);
        expect(Statety.read(computedKey2)).toBe(14);
    });

    it('should provide a snapshot of the parameter state', () => {
        const key = Statety.create<{
            age: number;
            name: string;
        }>('test', { age: 20, name: 'John' });
        const computedKey = Statety.compute('test-computed', [key], (state) => {
            state![0]!.age = state![0]!.age + 1;
            state![0]!.name = 'Jane';

            return state![0];
        });

        expect(Statety.read(computedKey)).toStrictEqual({ age: 21, name: 'Jane' });
        expect(Statety.read(key)).toStrictEqual({ age: 20, name: 'John' });
    });
  });

  describe('read', () => {
    it('should return null for non-existent key', () => {
      const nonExistentKey = Symbol('non-existent') as any;
      const value = Statety.read(nonExistentKey);
      
      expect(value).toBe(null);
    });

    it('should return the current value for existing key', () => {
      const key = Statety.create<number>('test-read', 42);
      const value = Statety.read(key);
      
      expect(value).toBe(42);
    });

    it('should return a snapshot of the current state', () => {
      const key = Statety.create<{
        age: number;
        name: string;
      }>('test-snapshot', { age: 20, name: 'John' });
      const value = Statety.read(key);
      value!.age = 21;
      value!.name = 'Jane';
      
      expect(value).toStrictEqual({ age: 21, name: 'Jane' });
      expect(Statety.read(key)).toStrictEqual({ age: 20, name: 'John' });
    });

    it('should read a derived state key', () => {
      const key = Statety.create<number>('test', 42);
      const derivedKey = Statety.derive('test-derived', key, (state) => state !== null ? state + 1 : 0);
      const value = Statety.read(derivedKey);
      
      expect(value).toBe(43);
    });

    it('should read a computed state key', () => {
      const key = Statety.create<number>('test', 42);
      const computedKey = Statety.compute('test-computed', [key], (state) => state !== null ? (state[0] ?? 0) + 1 : 0);
      const value = Statety.read(computedKey);
      
      expect(value).toBe(43);
    });
  });

  describe('set', () => {
    it('should set a new value', () => {
      const key = Statety.create<number>('test-set', 0);
      
      Statety.set(key, 10);
      expect(Statety.read(key)).toBe(10);
    });

    it('should silently fail for non-existent key', () => {
      const nonExistentKey = Symbol('non-existent') as any;
      
      // This should not throw an error
      expect(() => {
        Statety.set(nonExistentKey, 'test');
      }).not.toThrow();
    });

    it('should set a new value with a function', () => {
      const key = Statety.create<number>('test-set', 0);
      
      Statety.set(key, (state) => state !== null ? state + 1 : 0);
      expect(Statety.read(key)).toBe(1);
    });

    it('should set a new value with an object', () => {
      const key = Statety.create<{ age: number; name: string }>('test-set', { age: 20, name: 'John' });
      expect(Statety.read(key)).toStrictEqual({ age: 20, name: 'John' });

      Statety.set(key, { age: 21, name: 'Jane' });
      expect(Statety.read(key)).toStrictEqual({ age: 21, name: 'Jane' });
    });

    it('should set a new value with a function and an object', () => {
      const key = Statety.create<{ age: number; name: string }>('test-set', { age: 20, name: 'John' });
      expect(Statety.read(key)).toStrictEqual({ age: 20, name: 'John' });

      Statety.set(key, (state) => state !== null ? { age: state.age + 1, name: 'Jane' } : { age: 20, name: 'John' });
      expect(Statety.read(key)).toStrictEqual({ age: 21, name: 'Jane' });
    });
  });

  describe('subscribe', () => {
    it('should subscribe to a state key', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const callback = vi.fn();
        Statety.subscribe(key, callback);

        Statety.set(key, 1);
        expect(callback).toHaveBeenCalledWith(1);

        Statety.set(key, 2);
        expect(callback).toHaveBeenCalledWith(2);

        const subscribers = Statety[INTERNAL].getKeySubscribers(key);
        expect(subscribers.size).toBe(1);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(key);
        expect(cleanupFunctions.length).toBe(1);
    });

    it('should subscribe to a derived state key', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const derivedKey = Statety.derive('test-subscribe-derived', key, (state) => state !== null ? state + 1 : 0);
        const callback = vi.fn();
        Statety.subscribe(derivedKey, callback);

        Statety.set(key, 1);
        expect(callback).toHaveBeenCalledWith(2);

        Statety.set(key, 2);
        expect(callback).toHaveBeenCalledWith(3);

        const subscribers = Statety[INTERNAL].getKeySubscribers(derivedKey);
        expect(subscribers.size).toBe(1);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(derivedKey);
        expect(cleanupFunctions.length).toBe(2); // one from the derive and one from the subscribe
        expect(subscribers.size).toBe(1);
    });

    it('should subscribe to a computed state key', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const computedKey = Statety.compute('test-subscribe-computed', [key], (state) => state !== null ? (state[0] ?? 0) + 1 : 0);
        const callback = vi.fn();
        Statety.subscribe(computedKey, callback);

        Statety.set(key, 2);
        expect(callback).toHaveBeenCalledWith(3);

        Statety.set(key, 3);
        expect(callback).toHaveBeenCalledWith(4);

        const subscribers = Statety[INTERNAL].getKeySubscribers(computedKey);
        expect(subscribers.size).toBe(1);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(computedKey);
        expect(cleanupFunctions.length).toBe(2); // one from the compute and one from the subscribe
        expect(subscribers.size).toBe(1);
    });

    it('should unsubscribe from a state key', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const callback = vi.fn();
        const unsubscribe = Statety.subscribe(key, callback);
        
        Statety.set(key, 1);
        expect(callback).toHaveBeenCalledWith(1);

        unsubscribe();
        callback.mockClear();

        Statety.set(key, 2);
        expect(callback).not.toHaveBeenCalled();

        let subscribers = Statety[INTERNAL].getKeySubscribers(key);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(key);
        expect(cleanupFunctions.length).toBe(0);
    });

    it('should unsubscribe from a derived state key', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const derivedKey = Statety.derive('test-subscribe-derived', key, (state) => state !== null ? state + 1 : 0);
        const callback = vi.fn();
        const unsubscribe = Statety.subscribe(derivedKey, callback);
        
        Statety.set(key, 1);
        expect(callback).toHaveBeenCalledWith(2);

        unsubscribe();
        callback.mockClear();

        Statety.set(key, 2);
        expect(callback).not.toHaveBeenCalled();

        let subscribers = Statety[INTERNAL].getKeySubscribers(derivedKey);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(derivedKey);
        expect(cleanupFunctions.length).toBe(1); // one from the derive
    });

    it('should unsubscribe from a computed state key', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const computedKey = Statety.compute('test-subscribe-computed', [key], (state) => state !== null ? (state[0] ?? 0) + 1 : 0);
        const callback = vi.fn();
        const unsubscribe = Statety.subscribe(computedKey, callback);
        
        Statety.set(key, 1);
        expect(callback).toHaveBeenCalledWith(2);

        unsubscribe();
        callback.mockClear();

        Statety.set(key, 2);
        expect(callback).not.toHaveBeenCalled();

        let subscribers = Statety[INTERNAL].getKeySubscribers(computedKey);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(computedKey);
        expect(cleanupFunctions.length).toBe(1); // one from the compute
    });
  });

  describe('set & subscribe', () => {
    it('should not call the callback if the value is not changed', () => {
        const key = Statety.create<number>('test-subscribe', 0);
        const callback = vi.fn();
        Statety.subscribe(key, callback);

        Statety.set(key, 1);
        expect(callback).toHaveBeenCalledWith(1);
        callback.mockClear();

        Statety.set(key, 1);
        expect(callback).not.toHaveBeenCalled();
    });

    it('should call the callback even if the value is not changed when passing a whole object (object)', () => {
        const key = Statety.create<{ age: number; name: string }>('test-subscribe', { age: 20, name: 'John' });
        const callback = vi.fn();
        Statety.subscribe(key, callback);

        Statety.set(key, { age: 20, name: 'John' });
        expect(callback).toHaveBeenCalledWith({ age: 20, name: 'John' });
        callback.mockClear();

        Statety.set(key, { age: 20, name: 'John' });
        expect(callback).toHaveBeenCalledWith({ age: 20, name: 'John' });
    });

    it('should not call the callback if the value is not changed when using a function (object)', () => {
        const key = Statety.create<{ age: number; name: string }>('test-subscribe', { age: 20, name: 'John' });
        const callback = vi.fn();
        Statety.subscribe(key, callback);

        Statety.set(key, (state) => state !== null ? { age: state.age + 1, name: 'Jane' } : { age: 20, name: 'John' });
        expect(callback).toHaveBeenCalledWith({ age: 21, name: 'Jane' });
        callback.mockClear();

        Statety.set(key, (state) => state !== null ? state : { age: 20, name: 'John' });
        expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a state key', () => {
        const key = Statety.create<number>('test-delete', 0);
        Statety.delete(key);
        expect(Statety.read(key)).toBe(null);
    });

    it('should delete a derived state key', () => {
        const key = Statety.create<number>('test-delete', 0);
        const derivedKey = Statety.derive('test-delete-derived', key, (state) => state !== null ? state + 1 : 0);
        Statety.delete(derivedKey);
        expect(Statety.read(derivedKey)).toBe(null);
    });

    it('should delete a computed state key', () => {
        const key = Statety.create<number>('test-delete', 0);
        const computedKey = Statety.compute('test-delete-computed', [key], (state) => state !== null ? (state[0] ?? 0) + 1 : 0);
        Statety.delete(computedKey);
        expect(Statety.read(computedKey)).toBe(null);
    });

    it('should delete a key and the subscriptions to it', () => {
        const key = Statety.create<number>('test-delete', 0);
        const callback = vi.fn();
        Statety.subscribe(key, callback);
        Statety.delete(key);
        callback.mockClear();

        Statety.set(key, 1);
        expect(callback).not.toHaveBeenCalled();

        const subscribers = Statety[INTERNAL].getKeySubscribers(key);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(key);
        expect(cleanupFunctions.length).toBe(0);
    });

    it('should delete a key and the subscriptions to it (derived)', () => {
        const key = Statety.create<number>('test-delete', 0);
        const callback = vi.fn();
        const derivedKey = Statety.derive('test-delete-derived', key, callback);

        callback.mockClear();
        Statety.delete(derivedKey);
        Statety.set(key, 1);

        expect(callback).not.toHaveBeenCalled();

        const subscribers = Statety[INTERNAL].getKeySubscribers(derivedKey);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(derivedKey);
        expect(cleanupFunctions.length).toBe(0);
    });

    it('should delete a key and subscribers to it (derived)', () => {
        const key = Statety.create<number>('test-delete', 0);
        const callback = vi.fn();
        const derivedKey = Statety.derive('test-delete-derived', key, callback);

        Statety.delete(key);
        callback.mockClear();
        Statety.set(key, 1);
        expect(callback).not.toHaveBeenCalled();

        const subscribers = Statety[INTERNAL].getKeySubscribers(key);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(key);
        expect(cleanupFunctions.length).toBe(0);
    });

    it('should delete a key and the subscriptions to it (computed)', () => {
        const key = Statety.create<number>('test-delete', 0);
        const callback = vi.fn();
        const computedKey = Statety.compute('test-delete-computed', [key], callback);

        callback.mockClear();
        Statety.delete(computedKey);

        const subscribers = Statety[INTERNAL].getKeySubscribers(computedKey);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(computedKey);
        expect(cleanupFunctions.length).toBe(0);

        Statety.set(key, 1);
        expect(callback).not.toHaveBeenCalled();
    });

    it('should delete a key and subscribers to it (computed) - multiple keys', () => {
        const key = Statety.create<number>('test-delete', 0);
        const key2 = Statety.create<number>('test-delete2', 0);
        const callback = vi.fn();
        const computedKey = Statety.compute('test-delete-computed', [key, key2], callback);

        Statety.delete(key);
        const subscribers = Statety[INTERNAL].getKeySubscribers(key);
        expect(subscribers.size).toBe(0);
        const cleanupFunctions = Statety[INTERNAL].getKeyCleanupFunctions(key);
        expect(cleanupFunctions.length).toBe(0);

        callback.mockClear();
        Statety.set(key, 1);
        expect(callback).not.toHaveBeenCalled();

        callback.mockClear();
        Statety.set(key2, 1);
        expect(callback).toHaveBeenCalled();
    });
  });
});
