export type StatetyKey<T> = symbol & { __type: T; __keyBrand?: 'state' };
export type DerivedStatetyKey<T> = symbol & { __type: T; __keyBrand?: 'derived' };

export type AnyStatetyKey<T> = StatetyKey<T> | DerivedStatetyKey<T>;

const store = new Map();
const subscribers = new Map<symbol, Set<() => void>>();

class Statety {
    /* create key methods */
    create<T>(keyName: string, defaultValue?: T): StatetyKey<T> {
        const key = Symbol(keyName) as StatetyKey<T>;
        store.set(key, defaultValue ?? null);
        subscribers.set(key, new Set());
        return key;
    }

    derive<T, U>(
        keyName: string,
        sourceKey: StatetyKey<T>,
        computeFn: (state: T | null) => U
      ): DerivedStatetyKey<U> {
        const key = Symbol(keyName) as DerivedStatetyKey<U>;
        store.set(key, null);
        subscribers.set(key, new Set());

        const computeAndSet = () => {
          const sourceValue = this.get(sourceKey);
          const derivedValue = computeFn(sourceValue);
          this.changeAndNotify(key, derivedValue);
        };

        this.subscribe(sourceKey, computeAndSet);
        computeAndSet();
        return key;
    }

    /* action methods */

    get<T>(key: AnyStatetyKey<T>): T | null {
        if (!store.has(key)) {
            return null;
        }

        return store.get(key) as T | null;
    }

    set<T>(key: StatetyKey<T>, value: T | null | ((state: T | null) => T| null)) {
        if (!store.has(key)) {
            return; // Silent fail
        }

        let updatedValue = value;
        if (typeof value === 'function') {
            const currentState = store.get(key) as T | null;
            const clonedState = currentState ? structuredClone(currentState) : null;
            updatedValue = (value as (state: T | null) => T | null)(clonedState);
        }

        this.changeAndNotify(key, updatedValue);
    }

    subscribe<T>(key: AnyStatetyKey<T>, callback: () => void): () => void {
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

    delete<T>(key: AnyStatetyKey<T>) {
        this.changeAndNotify(key, null);

        store.delete(key);
        subscribers.delete(key);
    }

    /* private methods */

    private notify<T>(key: AnyStatetyKey<T>) {
        const keySubscribers = subscribers.get(key);
        if (keySubscribers) {
            keySubscribers.forEach(callback => callback());
        }
    }

    private changeAndNotify<T>(key: AnyStatetyKey<T>, value: T | null) {
        store.set(key, value);
        this.notify(key);
    }
}

const statety = new Statety();

export default statety as Statety;