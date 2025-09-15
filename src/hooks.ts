import { useSyncExternalStore, useCallback } from 'react';
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
