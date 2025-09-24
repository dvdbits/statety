---
title: useStatetyDerive
description: React hook for deriving and subscribing to specific parts of Statety state.
---

The `useStatetyDerive` hook allows you to **derive a value from a single Statety key inside a React component**. It acts like a component-level version of `Statety.derive`, automatically updating whenever the source key changes. You can also provide additional dependencies to dynamically influence the derivation.

## TypeScript Signature

```ts
function useStatetyDerive<T, U>(
  key: AnyStatetyKey<T>,
  selector: (state: T | null) => U,
  deps?: any[]
): U
```

### Parameters

- `key` – The Statety key to subscribe to. Can be a basic, derived, or computed state key.
- `selector` – A function that receives the current state and returns a derived value.
- `deps` – Optional array of dependencies that will trigger the selector to recompute when changed.

### Returns

- `U` – The value returned by the selector function.

## Example

### Using a Selector

```ts
import { Statety, useStatetyDerive } from "statety";

const USER_KEY = Statety.create<{ name: string; age: number }>("user", {
  name: "Alice",
  age: 25,
});

function UserProfile() {
  const [minAge, setMinAge] = useState(18);

  const isOldEnough = useStatetyDerive(
    USER_KEY,
    (user) => (user?.age ?? 0) >= minAge,
    [minAge]
  );

  return (
    <div>
      <p>Minimum Age: {minAge}</p>
      <p>User is {isOldEnough ? "old enough" : "too young"}</p>
      <button onClick={() => setMinAge(minAge + 1)}>Increase Min Age</button>
    </div>
  );
}
```

## Notes
- `useStatetyDerive` ensures the component only re-renders when the selected value changes, not the entire state.
- The optional `deps` array allows external parameters to trigger recomputation.
- Works with **basic**, **derived**, and **computed** keys.
- **Use this hook when dealing with data or calculations that depend on component-level parameters** (e.g., user input, local state) in React.