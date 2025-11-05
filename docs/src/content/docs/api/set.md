---
title: set
description: Update state values in Statety keys.
---

The `Statety.set` function is used to **update the value** of a state key. You can either replace the value outright or provide an updater function that receives the current state and returns a new value. This allows for **fine-grained functional updates**.

## TypeScript Signature

```ts
Statety.set<T>(
  key: StatetyKey<T>,
  value: T | null | ((state: T | null) => T | null)
): void
```
### Parameters

- `key` – The key identifying the basic state to update.  
- `value` – Either the new value to assign, null, or an updater function that receives the current value and returns the new one.

### Returns

- `void` – Does not return a value.


## Examples

### Replacing the entire State

```ts
import Statety from "statety";

const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});

// Replace the whole object
Statety.set(USER_KEY, { username: "john_doe", role: "admin" });
```

### Updating part of the State with an updater function
```ts
// Update just one field
Statety.set(USER_KEY, (state) => {
  if (state) state.role = "superadmin";
  return state;
});
```

## Notes
- `Statety.set` works only with basic state keys.
- Derived and computed state are automatically updated based on their dependencies.
