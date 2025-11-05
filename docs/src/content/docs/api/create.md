---
title: create
description: Create basic state keys in Statety.
---


The `Statety.create` function is used to **initialize a new piece of global state** and generate a key that can be used to access and update that state throughout your application. This is the fundamental way to define basic reactive state in Statety.

## TypeScript Signature

```ts
Statety.create<T>(keyName: string, defaultValue?: T | null): StatetyKey<T>
```
### Parameters

- `T` – The type of the state value.  
- `keyName` – A descriptive name for the key (used mainly for debugging).  
- `defaultValue` – Optional initial value for the state. Defaults to `null` if not provided.

### Returns

- `StatetyKey<T>` – A unique key that identifies the created state.

## Examples

### Basic Usage

```ts
import Statety from "statety";

// Create a basic global state key
const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});
```

### Without Initial Value
```ts
import Statety from "statety";

// State without providing a default value
const COUNTER_KEY = Statety.create<number>("counter");
```