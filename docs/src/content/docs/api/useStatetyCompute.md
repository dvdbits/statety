---
title: useStatetyCompute
description: React hook for subscribing to computed state from multiple Statety keys.
---

The `useStatetyCompute` hook allows you to **compute a value derived from multiple state keys inside a React component**. It acts like a component-level version of `Statety.compute`, automatically updating whenever any of the source keys change. You can also provide additional dependencies to dynamically influence the computation.

## TypeScript Signature

```ts
export function useStatetyCompute<T extends readonly any[], U>(
  keys: { [K in keyof T]: AnyStatetyKey<T[K]> },
  fn: (values: { [K in keyof T]: T[K] | null }) => U,
  deps?: any[]
): U
```

### Parameters

- `keys` – An array of Statety keys (basic, derived, or computed) that the computed value depends on.
- `fn` – A function that receives the current values of all keys and returns the computed result.
- `deps` - Optional array of additional dependencies that will trigger recalculation when changed.

### Returns

- `U` – The value returned by the computation function.

## Example

### Computing a Value from Multiple Keys

```ts
import { useState } from "react";
import { Statety, useStatetyCompute } from "statety";

const USER_KEY = Statety.create<{ username: string; role: string }>("user", {
  username: "guest",
  role: "visitor",
});

const ORDERS_KEY = Statety.create<Order[]>("orders", []);

function UserOrdersCount() {
  const [minQuantity, setMinQuantity] = useState(1);

  const count = useStatetyCompute([USER_KEY, ORDERS_KEY], ([user, orders]) => {
    if (!user || !orders) return 0;
    return orders.filter(order => order.user === user.username && order.quantity >= minQuantity).length;
  }, [minQuantity]); // Component-level dependency

  return (
    <div>
      <p>User orders with minimum quantity {minQuantity}: {count}</p>
      <button onClick={() => setMinQuantity(minQuantity + 1)}>Increase Min Quantity</button>
    </div>
  );
}
```

## Notes
- `useStatetyCompute` automatically subscribes to all keys provided, so the component re-renders whenever any dependency changes.
- The optional `deps` array allows external parameters to trigger recomputation.
- Works with **basic**, **derived**, and **computed** keys.
- **Use this hook when dealing with data or calculations that depend on component-level parameters** (e.g., user input, local state) in React.