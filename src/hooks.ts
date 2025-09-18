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


export function useStatetySelector<T, U>(
    key: AnyStatetyKey<T>,
    selector: (state: T | null) => U,
    deps?: any[]
): U {
    const memoizedSelector = useCallback(selector, deps || []);
    
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