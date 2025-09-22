import { produce } from "immer";

export type StatetyKey<T> = symbol & { __type: T; __keyBrand?: 'state' };
export type DerivedStatetyKey<T> = symbol & { __type: T; __keyBrand?: 'derived' };
export type ComputedStatetyKey<T> = symbol & { __type: T; __keyBrand?: 'computed' };

export type AnyStatetyKey<T> = StatetyKey<T> | DerivedStatetyKey<T> | ComputedStatetyKey<T>;

const store = new Map();
const subscribers = new Map<symbol, Set<(state: any | null) => void>>();
const cleanupFunctions = new Map<symbol, (() => void)[]>();

class Statety {
    /* create key methods */
    create<T>(keyName: string, defaultValue: T | null = null): StatetyKey<T> {
        const key = Symbol(keyName) as StatetyKey<T>;
        store.set(key, null);
        subscribers.set(key, new Set());

        this.set(key, defaultValue);
        return key;
    }

    derive<T, U>(
        keyName: string,
        sourceKey: AnyStatetyKey<T>,
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

        const unsubscribe = this.subscribe(sourceKey, computeAndSet);
        cleanupFunctions.set(key, [unsubscribe]);

        computeAndSet();
        return key;
    }

    compute<T extends readonly any[], U>(
        keyName: string,
        deps: { [K in keyof T]: AnyStatetyKey<T[K]> },
        fn: (values: { [K in keyof T]: T[K] }) => U
      ): ComputedStatetyKey<U> {
        const key = Symbol(keyName) as ComputedStatetyKey<U>;
        store.set(key, null);
        subscribers.set(key, new Set());

        const computeAndSet = () => {
            const depValues = deps.map(depKey => this.get(depKey)) as { [K in keyof T]: T[K] };
            const value = fn(depValues);
            this.changeAndNotify(key, value);
        };

        const cleanups: (() => void)[] = [];
        deps.forEach(depKey => {
            const unsubscribe = this.subscribe(depKey, computeAndSet);
            cleanups.push(unsubscribe);
        });
        cleanupFunctions.set(key, cleanups);

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
            updatedValue = produce(currentState, (draft: T | null) => {
                return (value as (state: T | null) => T | null)(draft);
            });
        } else if (value !== null && typeof value === "object") {
            updatedValue = structuredClone(value);
        }

        this.changeAndNotify(key, updatedValue);
    }

    subscribe<T>(key: AnyStatetyKey<T>, callback: (state: T | null) => void): () => void {
        if (!store.has(key)) {
            // Return a no-op unsubscribe function
            return () => {};
        }

        const keySubscribers = subscribers.get(key);
        if (keySubscribers) {
            keySubscribers.add(callback);
        }

        const cleanup = () => {
            const keySubscribers = subscribers.get(key);
            if (keySubscribers) {
                keySubscribers.delete(callback);
            }
        };

        const keyCleanupFunctions = cleanupFunctions.get(key);
        if (keyCleanupFunctions) {
            keyCleanupFunctions.push(cleanup);
        } else {
            cleanupFunctions.set(key, [cleanup]);
        }

        
        return cleanup;
    }

    delete<T>(key: AnyStatetyKey<T>) {
        this.changeAndNotify(key, null);

        subscribers.delete(key);
        const cfs = cleanupFunctions.get(key);
        if (cfs) {
            cfs.forEach(cleanupFunction => cleanupFunction());
            cleanupFunctions.delete(key);
        }
        store.delete(key);
    }

    /* private methods */

    private notify<T>(key: AnyStatetyKey<T>, value: T | null) {
        const keySubscribers = subscribers.get(key);
        if (keySubscribers) {
            keySubscribers.forEach(callback => callback(value));
        }
    }

    private changeAndNotify<T>(key: AnyStatetyKey<T>, value: T | null) {
        const oldValue = store.get(key) as T | null;
    
        if (oldValue !== value) {
            store.set(key, value);
            this.notify(key, value);
        }
    }
}

const statety = new Statety();

export default statety as Statety;