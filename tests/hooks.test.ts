import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStatety, useStatetyDerive, useStatetyCompute } from '../src/hooks';
import Statety from '../src/store';

describe('Statety Hooks', () => {
  describe('useStatety', () => {
    it('should return the current value of a state key', () => {
      const key = Statety.create<number>('test-hook', 42);
      
      const { result } = renderHook(() => useStatety(key));
      
      expect(result.current).toBe(42);
    });

    it('should return null for non-existent key', () => {
      const nonExistentKey = Symbol('non-existent') as any;
      
      const { result } = renderHook(() => useStatety(nonExistentKey));
      
      expect(result.current).toBe(null);
    });

    it('should update when state changes', () => {
      const key = Statety.create<number>('test-hook-update', 0);
      
      const { result } = renderHook(() => useStatety(key));
      
      expect(result.current).toBe(0);
      
      act(() => {
        Statety.set(key, 10);
      });
      
      expect(result.current).toBe(10);
    });

    it('should handle multiple state updates', () => {
      const key = Statety.create<number>('test-multiple-updates', 0);
      
      const { result } = renderHook(() => useStatety(key));
      
      expect(result.current).toBe(0);
      
      act(() => {
        Statety.set(key, 5);
      });
      expect(result.current).toBe(5);
      
      act(() => {
        Statety.set(key, 15);
      });
      expect(result.current).toBe(15);
      
      act(() => {
        Statety.set(key, (state) => state !== null ? state + 10 : 0);
      });
      expect(result.current).toBe(25);
    });

    it('should handle object state updates', () => {
      const key = Statety.create<{ count: number; name: string }>('test-object-update', { count: 0, name: 'test' });
      
      const { result } = renderHook(() => useStatety(key));
      
      expect(result.current).toEqual({ count: 0, name: 'test' });
      
      act(() => {
        Statety.set(key, { count: 5, name: 'updated' });
      });
      
      expect(result.current).toEqual({ count: 5, name: 'updated' });
    });

    it('should not re-render when value does not change', () => {
      const key = Statety.create<number>('test-no-rerender', 42);
      const hookSpy = vi.fn(() => useStatety(key));
      
      const { result, rerender } = renderHook(hookSpy);
      
      expect(result.current).toBe(42);
      expect(hookSpy).toHaveBeenCalledTimes(1);
      
      // Set the same value - should not cause re-render
      act(() => {
        Statety.set(key, 42);
      });
      
      expect(result.current).toBe(42);
      expect(hookSpy).toHaveBeenCalledTimes(1); // Still only called once
      
      // Force a re-render - hook should still return same value
      rerender();
      expect(result.current).toBe(42);
      expect(hookSpy).toHaveBeenCalledTimes(2); // Called again due to rerender()
    });
  });

  describe('useStatetyDerive', () => {
    it('should return derived value from source key', () => {
      const key = Statety.create<number>('test-derive-source', 5);
      
      const { result } = renderHook(() => 
        useStatetyDerive(key, (state) => state !== null ? state * 2 : 0)
      );
      
      expect(result.current).toBe(10);
    });

    it('should handle null source values', () => {
      const key = Statety.create<number>('test-derive-null');
      
      const { result } = renderHook(() => 
        useStatetyDerive(key, (state) => state !== null ? state + 1 : -1)
      );
      
      expect(result.current).toBe(-1);
    });

    it('should update when source state changes', () => {
      const key = Statety.create<number>('test-derive-update', 10);
      
      const { result } = renderHook(() => 
        useStatetyDerive(key, (state) => state !== null ? state * 2 : 0)
      );
      
      expect(result.current).toBe(20);
      
      act(() => {
        Statety.set(key, 15);
      });
      
      expect(result.current).toBe(30);
    });

    it('should not re-render when derived value does not change', () => {
      const key = Statety.create<number>('test-derive-no-rerender', 10);
      const deriveFn = vi.fn((state) => state !== null ? state * 2 : 0);
      const hookSpy = vi.fn(() => useStatetyDerive(key, deriveFn));
      
      const { result, rerender } = renderHook(hookSpy);
      
      expect(result.current).toBe(20);
      expect(hookSpy).toHaveBeenCalledTimes(1);
      expect(deriveFn).toHaveBeenCalledTimes(1);
      
      // Set the same value - should not cause re-render
      act(() => {
        Statety.set(key, 10); // Same value, same derived result (20)
      });
      
      expect(result.current).toBe(20);
      expect(hookSpy).toHaveBeenCalledTimes(1); // Still only called once
      expect(deriveFn).toHaveBeenCalledTimes(1); // Not called again since value didn't change
      
      // Force a re-render - hook should still return same value
      rerender();
      expect(result.current).toBe(20);
      expect(hookSpy).toHaveBeenCalledTimes(2); // Called again due to rerender()
    });
  });

  describe('useStatetyCompute', () => {
    it('should return computed value from multiple keys', () => {
      const key1 = Statety.create<number>('test-compute-1', 3);
      const key2 = Statety.create<number>('test-compute-2', 7);
      
      const { result } = renderHook(() => 
        useStatetyCompute([key1, key2], (values) => 
          values !== null ? (values[0] ?? 0) + (values[1] ?? 0) : 0
        )
      );
      
      expect(result.current).toBe(10);
    });

    it('should handle null dependency values', () => {
      const key1 = Statety.create<number>('test-compute-null-1');
      const key2 = Statety.create<number>('test-compute-null-2', 5);
      
      const { result } = renderHook(() => 
        useStatetyCompute([key1, key2], (values) => 
          values !== null ? (values[0] ?? 0) + (values[1] ?? 0) : 0
        )
      );
      
      expect(result.current).toBe(5);
    });

    it('should update when any dependency changes', () => {
      const key1 = Statety.create<number>('test-compute-update-1', 2);
      const key2 = Statety.create<number>('test-compute-update-2', 3);
      
      const { result } = renderHook(() => 
        useStatetyCompute([key1, key2], (values) => 
          values !== null ? (values[0] ?? 0) * (values[1] ?? 0) : 0
        )
      );
      
      expect(result.current).toBe(6); // 2 * 3
      
      act(() => {
        Statety.set(key1, 4);
      });
      
      expect(result.current).toBe(12); // 4 * 3
      
      act(() => {
        Statety.set(key2, 5);
      });
      
      expect(result.current).toBe(20); // 4 * 5
    });

    it('should not re-render when computed value does not change', () => {
      const key1 = Statety.create<number>('test-compute-no-rerender-1', 2);
      const key2 = Statety.create<number>('test-compute-no-rerender-2', 3);
      const computeFn = vi.fn((values) => 
        values !== null ? (values[0] ?? 0) * (values[1] ?? 0) : 0
      );
      const hookSpy = vi.fn(() => useStatetyCompute([key1, key2], computeFn));
      
      const { result, rerender } = renderHook(hookSpy);
      
      expect(result.current).toBe(6); // 2 * 3
      expect(hookSpy).toHaveBeenCalledTimes(1);
      expect(computeFn).toHaveBeenCalledTimes(1);
      
      // Set same values - should not cause re-render
      act(() => {
        Statety.set(key1, 2); // Same value
        Statety.set(key2, 3); // Same value
      });
      
      expect(result.current).toBe(6); // Still 6 (2 * 3)
      expect(hookSpy).toHaveBeenCalledTimes(1); // Still only called once
      expect(computeFn).toHaveBeenCalledTimes(1); // Not called again since values didn't change
      
      // Force a re-render - hook should still return same value
      rerender();
      expect(result.current).toBe(6);
      expect(hookSpy).toHaveBeenCalledTimes(2); // Called again due to rerender()
    });
  });
});
