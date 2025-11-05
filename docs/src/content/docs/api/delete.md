---
title: delete
description: Remove state keys and their associated values from Statety.
---

The `Statety.delete` function is used to **remove a state key and all its subscribers**, including those created manually via `Statety.subscribe`. This is useful for dynamic or temporary pieces of state that you want to clean up when they are no longer needed. Use with caution, as deleting a key will make it unavailable for future reads or updates.

## TypeScript Signature

```ts
Statety.delete<T>(key: AnyStatetyKey<T>): void
```

### Parameters

- `key` – The state key to delete. Can be basic, derived, or computed.

### Returns

- `void` – Does not return a value.

## Example

### Deleting a State Key

```ts
import Statety from "statety";

const USER_KEY = Statety.create<{ username: string }>("user", {
  username: "guest",
});

// Delete the key
Statety.delete(USER_KEY);

// After deletion, reading the key returns null
console.log(Statety.read(USER_KEY)); // Output: null
```

## Notes
- Deleting a key removes **all subscribers** associated with it.
- Use this method carefully for dynamic or temporary state to avoid unintended loss of data.
- Any future calls to `Statety.read` or `Statety.set` for the deleted key will have no effect.