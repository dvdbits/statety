---
title: Introduction & Quick Start
description: Welcome to Statety - introduction & quick start.
---

**Statety** is a simple React state management library built around the idea of a **reactive key–value store**. It provides a quick, intuitive way to define global state, update it from anywhere in your app, and derive new values when state changes.

## Quick Start

### 1. Install

```bash
npm install statety
```


### 2. Define state and use in React

Here’s a minimal counter example showing how to create global state, read it in a component, and update it:

```typescript
import Statety, { useStatety } from "statety";

// 1. Create a global state key
const counterKey = Statety.create<number>("counter", 0);

function Counter() {
  // 2. Read the state reactively inside a component
  const count = useStatety(counterKey);

  // 3. Update the state
  const increment = () => {
    Statety.set(counterKey, (prev) => (prev ?? 0) + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default Counter;
```


**It’s really that simple.** No complex classes, no verbose setup, no reducers or boilerplate. You just create keys, set values, and start using them instantly.

The rest of this documentation will guide you through Statety’s **core concepts**, its **API**, and the **design decisions** that make it both simple and flexible.