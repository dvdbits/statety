---
title: Caveats
description: Important caveats, limitations, and gotchas when using Statety.
---

While Statety is designed to be simple and flexible, there are a few scenarios to watch out for:

### Dependency Loops
Because derived and computed state can depend on other keys, it’s possible to accidentally create **circular dependencies** (e.g., `A` depends on `B` while `B` depends on `A`). This will cause infinite recomputation or unexpected results. Statety does not currently perform automatic cycle detection, so it’s up to you to design your state graph carefully.

### Nullability
As explained in the FAQ, all reads and values in `derive` and `compute` functions are typed as `T | null`. This ensures safety but also means you need to handle `null` explicitly. Forgetting to do so can lead to runtime errors.

### Manual Subscriptions
When you use `Statety.subscribe` directly, you’re responsible for managing the subscription lifecycle. Forgetting to unsubscribe can lead to memory leaks. React hooks (`useStatety`, `useStatetyDerive`, `useStatetyCompute`) handle this automatically.

---
