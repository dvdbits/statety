---
title: useStatety
description: React hook for subscribing to Statety state in components.
---

The `useStatety` hook allows you to **subscribe to a Statety key inside a React component** and get its current reactive value. Whenever the state associated with the key changes, the component automatically re-renders with the updated value.

## TypeScript Signature

```ts
function useStatety<T>(key: AnyStatetyKey<T>): T | null
```

### Parameters

- `key` – The Statety key to subscribe to. Can be a basic, derived, or computed state key.

### Returns

- `T | null` – The current value associated with the key.

## Example

### Basic Usage in a React Component

```ts
import { Statety, useStatety } from "statety";

const counterKey = Statety.create<number>("counter", 0);

function Counter() {
  const count = useStatety(counterKey);

  const increment = () => {
    Statety.set(counterKey, (prev) => (prev ?? 0) + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## Notes
- `useStatety` automatically subscribes your component to state changes, so no manual subscription is needed.
- The component will re-render only when the value of the subscribed key changes.
- Works with **basic**, **derived**, and **computed** keys.