---
title: read
description: Retrieve state values from Statety keys.
---

The `Statety.read` function is used to **retrieve the current value** of a state key. It returns a **snapshot** of the state at the moment it’s called. Note that `Statety.read` does **not** automatically subscribe your component to future updates — use `useStatety` or `Statety.subscribe` for reactive behavior.

## TypeScript Signature

```ts
Statety.read<T>(key: AnyStatetyKey<T>): T | null
```
### Parameters

- `key` – The key identifying the state to read. Can be a basic, derived, or computed state key.

### Returns

- `T | null` – The current value associated with the key.

## Example

```ts
import Statety from "statety";

const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});

const user = Statety.read(USER_KEY);
console.log(user?.username); // Output: "guest"
```