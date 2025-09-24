---
title: subscribe
description: Subscribe to state changes manually.
---

The `Statety.subscribe` function allows you to **listen for changes** on a specific state key. Whenever the state associated with the key changes, your callback function is invoked. This is useful for non-React code or side effects that need to respond to state updates.

## TypeScript Signature

```ts
Statety.subscribe<T>(
  key: AnyStatetyKey<T>,
  callback: (state: T | null) => void
): () => void
```

### Parameters

- `key` – The state key to subscribe to. Can be basic, derived, or computed.
- `callback` – A function that will be called whenever the state changes.

### Returns

- `() => void` – A function that unsubscribes the listener when called.


## Example

### Subscribing to State Changes

```ts
import { Statety } from "statety";

const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});

// Subscribe to changes
const unsubscribe = Statety.subscribe(USER_KEY, (state) => {
  console.log("User state changed!", state);
});

// Update state
Statety.set(USER_KEY, { username: "john_doe", role: "admin" });
// Console: "User state changed!" { username: "john_doe", role: "admin" }


// Stop listening to changes
unsubscribe();
```

## Notes
- Subscriptions created using `Statety.subscribe` **must be manually removed** by calling the returned unsubscribe function to prevent memory leaks if you do not delete the key.

