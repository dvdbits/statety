import { useSyncExternalStore, useCallback } from 'react';
import statety from './store';
import { StatetyKey } from './store';

export function useStatety<T>(key: StatetyKey<T>): T | null {
    const subscribe = useCallback((callback: () => void) => {
        return statety.subscribe(key, callback);
    }, [key]);

    const getSnapshot = useCallback(() => {
        return statety.get(key);
    }, [key]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    return value;
}
