type StatetyKey<T> = symbol & { __type: T };

const store = new Map();

class Statety {
    create<T>(keyName: string, defaultValue?: T): StatetyKey<T> {
        const key = Symbol(keyName) as StatetyKey<T>;
        store.set(key, defaultValue ?? null);
        return key;
    }

    get<T>(key: StatetyKey<T>): T | null {
        return store.get(key) as T | null;
    }

    set<T>(key: StatetyKey<T>, value: T | null | ((state: T | null) => T| null)) {
        if (typeof value === 'function') {
            const currentState = store.get(key) as T | null;
            const clonedState = currentState ? structuredClone(currentState) : null;
            const updatedValue = (value as (state: T | null) => T | null)(clonedState);
            store.set(key, updatedValue);
        } else {
            store.set(key, value);
        }
    }
}

const statety = new Statety();

export default statety as Statety;