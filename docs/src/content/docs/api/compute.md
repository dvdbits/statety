---
title: compute
description: Create computed state that combines multiple state keys into a single value.
---

The `Statety.compute` function is used to create **computed state** derived from **multiple dependency keys**. Computed state updates automatically whenever any of its dependencies change, allowing you to combine multiple pieces of state into a single cohesive value.

## TypeScript Signature

```ts
Statety.compute<T extends readonly any[], U>(
  keyName: string,
  deps: { [K in keyof T]: AnyStatetyKey<T[K]> },
  fn: (values: { [K in keyof T]: T[K] }) => U
): ComputedStatetyKey<U>
```

## Example

### Creating a Computed State

```ts
import Statety from "statety";

const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});

const ORDERS_KEY = Statety.create<Order[]>("orders", []);

// Compute the number of orders for the current user
const USER_ORDERS_COUNT_KEY = Statety.compute(
  "user-orders-count",
  [USER_KEY, ORDERS_KEY],
  ([user, orders]) => {
    if (!user || !orders) return 0;
    return orders.filter(order => order.user === user.username).length;
  }
);

const count = Statety.read(USER_ORDERS_COUNT_KEY);
console.log(count); // Output: 0
```

## Notes
- Computed state **cannot be set manually**; it updates automatically when any dependency changes.
- It is ideal for combining multiple pieces of state into one computed value.
- Dependencies can include any combination of basic, derived, or other computed state keys.
