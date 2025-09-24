---
title: FAQ
description: Frequently asked questions about Statety.
---

### Why do functions return `T | null` instead of just `T`?

In Statety, functions that **read state** (such as `get`, `derive`, and `compute`) return `T | null`. This is because a key’s value may not exist or may be uninitialized at the time of access. For derived and computed state, the parameters passed into your derivation or computation logic are also typed as `T | null` to reflect this possibility.  

In my experience working in TypeScript codebases, encountering `null` at runtime is not uncommon, especially when dealing with dynamic or optional data. By including `null` in the type system, the store **forces you to consider this case explicitly**, adding a layer of safety and predictability.  

While this approach introduces some extra verbosity and may feel like noise, it helps catch potential missing or uninitialized state early, reducing the risk of runtime errors and making your code more robust.

---

### Why can't I use `set` with derived or computed state?

Derived and computed state are **automatically maintained** based on other keys. Manually setting these values would break their core purpose and consistency guarantees.  

Currently, TypeScript enforces this restriction at **compile-time**, but it is possible to bypass it using TypeScript tricks such as `as any` or other type assertions. This could be considered an **experimental escape hatch** for developers who have very specific use cases, though it is generally discouraged.  

I am also **considering adding a runtime check** in the future to prevent accidental manual updates to derived or computed keys, which would enforce this restriction even outside of TypeScript’s type system.

---

### What happens if I try to `set` a key that no longer exists?

Setting a deleted or uninitialized key will **silently fail**. This is intentional to avoid unnecessary errors when working with dynamic state that may have already been removed.

---

### How does Statety handle immutability?

- When creating or setting a state with a plain object, Statety uses `structuredClone` to deep clone the value, preventing accidental mutations.  
- When updating via an updater function, Statety uses Immer’s `produce` internally, allowing ergonomic immutable updates while keeping performance optimized.

---

### How are derived and computed states different?

- **Derived state (`derive`)** – Depends on a **single key**, used to create slices, flags, or simple transformations.  
- **Computed state (`compute`)** – Depends on **multiple keys**, allowing you to combine several pieces of state into one cohesive value.

---

### How do `useStatetyDerive` and `useStatetyCompute` differ from `derive` and `compute`?

These hooks are **component-level counterparts**:  

- They allow you to perform calculations that depend on **component-specific parameters** such as local React state or props.  
- `useStatetyDerive` works with a single key and optional dynamic parameters.  
- `useStatetyCompute` works with multiple keys and optional dynamic parameters.  
- Use them **when the calculation depends on values available inside a React component**.

---

### When should I use `Statety.delete`?

Use `delete` for **dynamic or temporary state** that is no longer needed. All internal subscriptions are removed, included the **manual subscriptions created via `Statety.subscribe`**.

