# Statety

Statety is a simple, type-safe, and flexible state management library designed to give you strong control over your global app state, derived values from that state, and computed values built from multiple pieces of state.

## Motivation

I built Statety out of a personal need for a simple and straightforward way to declare and manage global reactive state across an application. In my experience, many state management solutions require writing extensive amounts of code, complex classes, custom hooks, and multiple helper functions, just to achieve basic reactive global state functionality.

Statety aims to **cut through this noise** by offering a minimal yet powerful API that makes defining state intuitive and flexible. I wanted a solution where I don't have to worry about where to define cross-state computations, and where I have clear visibility into when my calculations actually trigger.

Beyond simplicity, I wanted to provide **flexibility**. With Statety, you can create and update state wherever it makes sense for your app's architecture. Whether you prefer updating state inside React components or through external service functions, it's your choice; Statety adapts to your workflow. It should be clear where to create state, how to split data into small, manageable reactive pieces, and how to import and compose stores from different parts of the app.

**Statety may not be the best solution for highly complex systems** with intricate state orchestration needs, but if you need a simple, straightforward library just to manage global state with clear reactivity guarantees, this is it.

Please note that **Statety is a work in progress**, particularly around tooling and debugging features. While the core functionality is solid, additional development tools and advanced features are still being developed. This library embodies lessons I learned from working with other state management solutions, improving on common pain points related to typing, boilerplate, and composability. I’m also evaluating new patterns and features in the state-management space, so Statety will continue to evolve as I test those ideas.

## Core Concepts

### State Keys

Statety uses keys as the primary identifiers and access points to manage pieces of state throughout your application. These keys are implemented as JavaScript Symbols, ensuring that each key is intrinsically unique. While you provide a descriptive key name when creating each Symbol, this name serves mainly as a human-friendly label, aiding identification during debugging and development without affecting the uniqueness guarantee.

### State Types

Statety works with three kinds of state keys, each serving a different purpose:

- **Basic State**: The simplest form of state—used to store raw data you want available globally. For example, user info, settings, or lists.
- **Derived State**: Values calculated from a single state key. Useful for flags or transformations tightly coupled to a specific state piece.
- **Computed State**: More flexible derived values that depend on multiple keys. This allows combining several state slices into one cohesive computed value.

## API Reference

### Creating State

#### `Statety.create<T>(keyName: string, defaultValue?: T | null): StatetyKey<T>`

Initialize a new piece of global state and get back a typed key to access and modify it.

**Example:**
```typescript
const USER_KEY = Statety.create<{ username: string; role: string }>('user', {
    username: 'guest',
    role: 'visitor',
});
```

### Reading State

#### `Statety.get<T>(key: AnyStatetyKey<T>): T | null`

Retrieve the current value associated with a given key. This is a **snapshot** and does not react to future changes by itself.

**Example:**
```typescript
const user = Statety.get(USER_KEY);
console.log(user?.username);  // Output: "guest"
```

### Updating State

#### `Statety.set<T>(key: StatetyKey<T>, value: T | null | ((state: T | null) => T | null)): void`

Update the state associated with a basic key either by replacing it outright or by applying an "updater" function that receives the previous state and returns a new one. This allows fine-grained, functional updates.

**Example:**
```typescript
// Replace the whole object
Statety.set(USER_KEY, { username: 'john_doe', role: 'admin' });

// Update just one field
Statety.set(USER_KEY, (state) => {
    if (state) state.role = 'superadmin';
    return state;
});
```

### Derived State

#### `Statety.derive<T, U>(keyName: string, sourceKey: AnyStatetyKey<T>, computeFn: (state: T | null) => U): DerivedStatetyKey<U>`

Create a piece of derived state that automatically updates whenever the source key changes. Derived state can act like a selector, isolating and working with specific portions of a larger state. Additionally, it can perform small computations or transformations based on that source state, allowing you to encapsulate and reuse logic tied closely to a single piece of data.

**Example:**
```typescript
const USER_ROLE_KEY = Statety.derive('user-role', USER_KEY, (user) => user?.role ?? 'guest');

const role = Statety.get(USER_ROLE_KEY); // Will return "visitor" initially
```

### Computed State

#### `Statety.compute<T extends readonly any[], U>(keyName: string, deps: { [K in keyof T]: AnyStatetyKey<T[K]> }, fn: (values: { [K in keyof T]: T[K] }) => U): ComputedStatetyKey<U>`

Create a computed state derived from multiple dependency keys, automatically updating when any dependency changes.


**Example:**
```typescript
const ORDERS_KEY = Statety.create<Order[]>('orders', []);

const USER_ORDERS_COUNT_KEY = Statety.compute(
  'user-orders-count',
  [USER_KEY, ORDERS_KEY],
  ([user, orders]) => {
    if (!user || !orders) return 0;
    return orders.filter(order => order.userId === user.username).length;
  }
);
```

### Subscribing to Changes

#### `Statety.subscribe<T>(key: AnyStatetyKey<T>, callback: () => void): () => void`

Subscribe to changes on a state key. Returns a function to unsubscribe when done.

**Example:**
```typescript
const unsubscribe = Statety.subscribe(USER_KEY, () => {
  console.log('User state changed!');
});
```

### Deleting State

#### `Statety.delete<T>(key: AnyStatetyKey<T>): void`

Experimental: Removes the key and all related subscribers. Useful for dynamic or temporary pieces of state that you want to clean up when no longer needed.

Use with caution!

**Example:**
```typescript
Statety.delete(USER_KEY);
```

### React Integration

#### `useStatety<T>(key: AnyStatetyKey<T>): T | null`

Use the ```useStatety``` hook inside your React components to subscribe to changes of a Statety key and get its current reactive value. The hook will cause your component to re-render automatically whenever the state for the key changes.

**Example:**
```typescript
// Create a key outside component
const counterKey = Statety.create<number>('counter', 0);

function CounterApp() {
  // Subscribe to reactive state value updates inside the component
  const count = useStatety(counterKey);

  // Use Statety.set to update the state value explicitly
  const increment = () => {
    Statety.set(counterKey, (prev) => (prev !== null ? prev + 1 : 0));
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## FAQ

**Why does ```set``` returns ```T | null```?**

In my experience working extensively with TypeScript codebases, I’ve often encountered situations where ```null``` values unexpectedly appear at runtime in places where they shouldn’t. Given that Statety internally stores state using a map structure and with the flexibility to easily add or delete keys, I chose to explicitly include ```null``` in the return type of set (and related methods) as a safeguard to raise awareness of the potential case where the value may be ```null```.

While this approach might seem at odds with the **“cut through noise”** philosophy I emphasize elsewhere, it embraces a more defensive and reliable pattern when accessing state. Encouraging explicit ```null``` checks helps catch potential missing or uninitialized state early, improving safety and predictability.

Of course, you can choose to bypass explicit ```null``` checks by relying on your own TypeScript guarantees but doing so is at your own risk.
Handling potential ```null``` values adds a layer of safety and predictability when reading state.


**Why can't I use ```set``` with derived and computed state?**

Derived and computed state are designed to represent values that result from operations based on basic state or other derived/computed states. Allowing manual updates to these types of state would contradict their core purpose, which is to provide consistent, automatically maintained data derived from other sources.

That said, these restrictions currently exist only at the TypeScript compile-time level. With some TypeScript techniques, it’s still possible to manually set the state of a derived or computed key. While this flexibility could be proved useful in unique scenarios, it is generally discouraged because it breaks the fundamental guarantees of the state system.

I am considering adding runtime checks in the future to prevent this manual mutation, but for now, this “escape hatch” remains available as an experimental option for developers who might want to use it, with the caveat that it’s not recommended. Manually setting derived or computed state will override its value temporarily, but it will get overwritten again on the next dependency change.


**What happens if I try to ```set``` a key that does not longer exists?**

If you attempt to set a value for a key that no longer exists in the store, the operation will silently fail without throwing any errors. This is intentional because the situation should typically represent an obviously incorrect usage pattern. In addition, due to how reactivity and rerenders work, sometimes set calls may still occur for keys that have already been deleted. Often these calls don’t carry meaningful intent. Silently ignoring these avoids unnecessary overhead and noise from error handling, keeping the library behavior simple and predictable.


**How does Statety handle state immutability when adding, creating, or setting values?**

When you create a new key or set its value directly with a plain object, the library uses ```structuredClone``` under the hood. This deep clones the value, preventing accidental mutations to shared references and ensuring that Statety takes full ownership of the stored data. This approach is especially useful when dealing with objects or arrays, as it guards against unexpected changes elsewhere in your application.

When you update state by passing a function to ```set```, Statety leverages Immer’s ```produce``` method to provide an ergonomic way to "mutate" state immutably. Your update function receives a draft state which you can safely modify as if it were mutable. Immer efficiently applies the changes, only updating what’s necessary and maintaining structural sharing resulting in optimal performance and predictable state updates.



