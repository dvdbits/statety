# Statety

Statety is a simple React state management library built around the idea of a reactive key–value store. It provides a quick, intuitive way to define global state, update it from anywhere in your app, and derive new values when state changes.

## Quick Start

Install the package:

```bash
npm install statety
```

Create and use global state in your React app:

```typescript
import Statety, { useStatety } from "statety";

// Create a global counter key
const COUNTER_KEY = Statety.create<number>("counter", 0);

function Counter() {
  // Subscribe to reactive state value
  const count = useStatety(COUNTER_KEY);

  // Update the state
  const increment = () => {
    Statety.set(COUNTER_KEY, (prev) => prev !== null ? prev + 1 : 0);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

It's that simple to get started!

## Documentation

If you want to dive into the details of Statety’s concepts and API, check out the full documentation site: [Documentation](https://statety.dev)
