export type StatetyKey<T> = symbol & { __type: T };

const store = new Map();
const subscribers = new Map<symbol, Set<() => void>>();

class Statety {
    create<T>(keyName: string, defaultValue?: T): StatetyKey<T> {
        const key = Symbol(keyName) as StatetyKey<T>;
        store.set(key, defaultValue ?? null);
        subscribers.set(key, new Set());
        return key;
    }

    get<T>(key: StatetyKey<T>): T | null {
        if (!store.has(key)) {
            return null;
        }

        return store.get(key) as T | null;
    }

    set<T>(key: StatetyKey<T>, value: T | null | ((state: T | null) => T| null)) {
        if (!store.has(key)) {
            return; // Silent fail
        }

        if (typeof value === 'function') {
            const currentState = store.get(key) as T | null;
            const clonedState = currentState ? structuredClone(currentState) : null;
            const updatedValue = (value as (state: T | null) => T | null)(clonedState);
            store.set(key, updatedValue);
        } else {
            store.set(key, value);
        }

        this.notify(key);
    }

    subscribe<T>(key: StatetyKey<T>, callback: () => void): () => void {
        if (!store.has(key)) {
            // Return a no-op unsubscribe function
            return () => {};
        }

        const keySubscribers = subscribers.get(key);
        if (keySubscribers) {
            keySubscribers.add(callback);
        }
        
        return () => {
            const keySubscribers = subscribers.get(key);
            if (keySubscribers) {
                keySubscribers.delete(callback);
            }
        };
    }

    delete<T>(key: StatetyKey<T>) {
        this.set(key, null);

        store.delete(key);
        subscribers.delete(key);
    }

    private notify<T>(key: StatetyKey<T>) {
        const keySubscribers = subscribers.get(key);
        if (keySubscribers) {
            keySubscribers.forEach(callback => callback());
        }
    }
}

const statety = new Statety();

export default statety as Statety;