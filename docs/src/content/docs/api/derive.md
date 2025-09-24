---
title: derive
description: Create derived state that automatically updates when its source changes.
---

The `Statety.derive` function is used to create a **derived state** that automatically updates whenever its **source state** changes. Derived state is useful for values computed from a single piece of state, such as flags, transformations, or slices of larger objects.

## TypeScript Signature

```ts
Statety.derive<T, U>(
  keyName: string,
  sourceKey: AnyStatetyKey<T>,
  fn: (state: T | null) => U
): DerivedStatetyKey<U>
```
### Parameters

- `keyName` – A descriptive name for the derived key. 
- `sourceKey` – The state key that this derived value depends on. 
- `computeFn` – A function that receives the current value of the source key and returns the derived value.

### Returns

- `DerivedStatetyKey<U>` – A new key representing the derived state.


## Example

### Creating a Derived State

```ts
import { Statety } from "statety";

const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});

// Create a derived state for the user's role
const USER_ROLE_KEY = Statety.derive("user-role", USER_KEY, (user) => user?.role ?? "guest");

const role = Statety.read(USER_ROLE_KEY);
console.log(role); // Output: "visitor"

```

## Notes
- Derived state **cannot be set manually**; it updates automatically when the source key changes.
- Derived state is ideal for transforming or selecting a portion of a single source state.
- You can derive from **any** type of state key.
