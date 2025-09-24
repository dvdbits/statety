---
title: Core Concepts
description: Understanding the fundamental concepts that make Statety work.
---

Understanding the core ideas behind Statety will help you get the most out of it. The library is built around a few simple but powerful concepts: **keys**, and the three kinds of state you can create from them.

## State Keys

Every piece of state in Statety is identified by a key. Under the hood, keys are implemented as JavaScript **Symbols**, which guarantees that each key is intrinsically unique. This ensures you never run into collisions, even if two keys share the same descriptive name. The name you provide when creating a key is mainly a human-friendly label, useful for debugging and development.

The three types of state are:

- **Basic State**: Holds raw global data, such as user objects, settings, or lists. You can create, read, and update it directly.  
- **Derived State**: Represents values computed from a single state key. It’s useful for transformations or flags that depend on one piece of data, and updates automatically when the source changes.  
- **Computed State**: Combines multiple keys into a single value. Computed state updates automatically whenever any of its dependencies change, allowing you to express relationships across different parts of your state.

