import { useSyncExternalStore, useCallback, useState, useRef, useEffect } from 'react';
import statety, { AnyStatetyKey } from './store';

export function useStatety<T>(key: AnyStatetyKey<T>): T | null {
    const subscribe = useCallback((callback: () => void) => {
        return statety.subscribe(key, callback);
    }, [key]);

    const getSnapshot = useCallback(() => {
        return statety.get(key);
    }, [key]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}


export function useStatetyDerive<T, U>(
    key: AnyStatetyKey<T>,
    fn: (state: T | null) => U,
    deps?: any[]
): U {
    const memoizedSelector = useCallback(fn, deps || []);
    
    const subscribe = useCallback((callback: () => void) => {
        return statety.subscribe(key, callback);
    }, [key]);

    const getSnapshot = useCallback(() => {
        const currentState = statety.get(key);
        return memoizedSelector(currentState);
    }, [key, memoizedSelector]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}

export function useStatetyCompute<T extends readonly any[], U>(
    keys: { [K in keyof T]: AnyStatetyKey<T[K]> },
    fn: (values: { [K in keyof T]: T[K] | null }) => U,
    deps?: any[]
): U {
    const memoizedSelector = useCallback(fn, deps || []);
    
    const subscribe = useCallback((callback: () => void) => {
        const unsubscribes = keys.map(key => statety.subscribe(key, callback));
        
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [keys]);

    const getSnapshot = useCallback(() => {
        const values = keys.map(key => statety.get(key)) as { [K in keyof T]: T[K] | null };
        return memoizedSelector(values);
    }, [keys, memoizedSelector]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}