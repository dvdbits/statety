import { useSyncExternalStore, useCallback, useRef } from 'react';
import statety, { StatetyKey, INTERNAL } from './store';

export function useStatety<T>(key: StatetyKey<T>): T | null {
    const subscribe = useCallback((callback: () => void) => {
        return statety.subscribe(key, callback);
    }, [key]);

    const getSnapshot = useCallback(() => {
        return statety[INTERNAL].get(key);
    }, [key]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}

export function useStatetyDerive<T, U>(
    key: StatetyKey<T>,
    fn: (state: T | null) => U,
    deps?: any[]
): U {
    const memoizedSelector = useCallback(fn, deps || []);
    const lastStateRef = useRef<T | null>(null);
    const lastDepsRef = useRef<any[] | null>(null);
    const lastResultRef = useRef<U | null>(null);
    
    const subscribe = useCallback((callback: () => void) => {
        return statety.subscribe(key, callback);
    }, [key]);

    const getSnapshot = useCallback(() => {
        const currentState = statety[INTERNAL].get(key);
        const currentDeps = deps || [];
        
        // Only recompute if the state reference OR deps have changed
        if (currentState !== lastStateRef.current || 
            !lastDepsRef.current || 
            currentDeps.length !== lastDepsRef.current.length ||
            currentDeps.some((dep, index) => dep !== lastDepsRef.current![index])) {
            
            const clonedState = statety.read(key);
            const result = memoizedSelector(clonedState);
            lastStateRef.current = currentState;
            lastDepsRef.current = currentDeps;
            lastResultRef.current = result;
            return result;
        }
        
        return lastResultRef.current!;
    }, [key, memoizedSelector, deps]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}

export function useStatetyCompute<T extends readonly any[], U>(
    keys: { [K in keyof T]: StatetyKey<T[K]> },
    fn: (values: { [K in keyof T]: T[K] | null }) => U,
    deps?: any[]
): U {
    const memoizedSelector = useCallback(fn, deps || []);
    const lastStatesRef = useRef<{ [K in keyof T]: T[K] | null } | null>(null);
    const lastDepsRef = useRef<any[] | null>(null);
    const lastResultRef = useRef<U | null>(null);
    
    const subscribe = useCallback((callback: () => void) => {
        const unsubscribes = keys.map(key => statety.subscribe(key, callback));
        
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [keys]);

    const getSnapshot = useCallback(() => {
        const currentStates = keys.map(key => statety[INTERNAL].get(key)) as { [K in keyof T]: T[K] | null };
        const currentDeps = deps || [];
        
        // Only recompute if any state reference OR deps have changed
        if (!lastStatesRef.current || 
            currentStates.some((state, index) => state !== lastStatesRef.current![index]) ||
            !lastDepsRef.current ||
            currentDeps.length !== lastDepsRef.current.length ||
            currentDeps.some((dep, index) => dep !== lastDepsRef.current![index])) {
            
            const clonedStates = keys.map(key => statety.read(key)) as { [K in keyof T]: T[K] | null };
            const result = memoizedSelector(clonedStates);
            lastStatesRef.current = currentStates;
            lastDepsRef.current = currentDeps;
            lastResultRef.current = result;
            return result;
        }
        
        return lastResultRef.current!;
    }, [keys, memoizedSelector, deps]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}