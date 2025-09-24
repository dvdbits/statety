---
title: Motivation & Usage
description: Why Statety was created and it's usage cases
---

## Motivation

I created Statety because I wanted **less noise** when working with global state. I did not want to write classes, boilerplate functions, or manually define reactive properties and setters just to get state that updates across an application. Instead, I wanted something **simple and straightforward**: the ability to create a key, set a value, and instantly have a reactive global store that just works.

**Flexibility** was another important factor. At its core, Statety is just a reactive key–value store, and that simplicity means you can write to and read from state **anywhere** it makes sense in your application. Whether the update happens inside a React component, in a service function, or deep within a utility module, the flow is always the same: get the key, set the value, and the rest of the system reacts automatically. This makes state updates natural to express and easy to place wherever they belong in your codebase, without needing special wrappers or additional setup.

Beyond simplicity, Statety is also about exploring different ways to think about state management. It reflects lessons learned from real projects and experiments with approaches that challenge some of the assumptions made by other libraries. The goal is to offer a straightforward tool that works out of the box, while also pushing the boundaries of what a state management library can provide.


## Usage

Statety is best suited for simple scenarios where you just need reactive global state without worrying about building a full system. You can **define state and start using it right away**, making it ideal for small to medium use cases. At the same time, its design leaves room to grow, with features like derived and computed state that can support more complex applications as your needs evolve.
