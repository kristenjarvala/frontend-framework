# Dot.js Frontend Framework

> A lightweight frontend framework built from scratch for the Kood// Dot.js task.
> 
> We wanted to learn how frameworks like React work, so we built our own using vanilla JavaScript, Proxies, and a Virtual DOM.

---

## About the Project
This project explores the core concepts of modern frontend frameworks. Instead of using libraries, we wrote the logic for component rendering, state management, and routing ourselves.

### Design Principles (How it works)
We followed a "Framework Convention" approach:
1.  **Virtual DOM**: We don't touch the DOM directly. We create a "virtual" tree of objects using our `bench` function, compare it with the previous tree, and only update what changed.
2.  **Reactive State**: We use JavaScript `Proxy` objects. When you change a property in the state, the framework notices and automatically re-renders the component.
3.  **One-Way Data Flow**: Data moves down from parent components to children via props. Events move up.

---

## Getting Started

Here is how to get the framework running and build your first component.

### 1. Installation
You just need Python installed to run the local server.

```bash
git clone https://gitea.kood.tech/kenetjets/frontend-framework
cd frontend-framework
```

### 2. Running the Project

**Start the server**
This handles saving your todos.
```bash
python example/server.py
```

Open **[http://localhost:8000/](http://localhost:8000/)** in your browser to see the Todo App.
Open **[http://localhost:8000/calculatorExample/](http://localhost:8000/calculatorExample/)** in your browser to see the Calculator App.

---

### 3. Build Your First Component
Here is how easy it is to make a "Counter" component.

**Step 1:** Import the core tools.
```javascript
import { Component } from "../framework/common/component.js";
import { bench } from "../framework/dom/bench.js";
import { mount } from "../framework/dom/mount.js";
```

**Step 2:** Create a class extending `Component`.
```javascript
class Counter extends Component {
  constructor() {
    super();
    // Initialize your state here
    this.state = { count: 0 };
  }

  render() {
    // 'bench' creates elements: bench(tag, props, children)
    return bench("div", { style: { padding: "20px" } }, [
      bench("h1", {}, [`Count: ${this.state.count}`]),
      bench("button", {
        // Event listeners are just functions
        onClick: () => this.state.count++ 
      }, ["Increment"])
    ]);
  }
}
```

**Step 3:** Mount it to the DOM.
```javascript
const app = new Counter();
mount(app.render(), document.getElementById("app"));
```

---

## What We Built (Features)

### 1. The `bench` Function (Virtual DOM)
Instead of writing HTML, you write JavaScript. Elements can be nested endlessly.

```javascript
bench("div", { id: "container" }, [
  bench("p", { className: "text" }, ["Hello World"])
])
```

### 2. Component System
Components are reusable classes. They handle their own state and lifecycle.
- **`constructor()`**: Setup state.
- **`render()`**: Define the UI.
- **`mount()`**: Automatically called when added to the DOM.

### 3. Reactive State
You don't need to call `update()`. Just change the variable.
- Application state can be shared (using a global Store).
- State persists between page loads (using `persistence.js`).

### 4. Styles & Attributes
You can pass styles as objects. We handle applying them.

```javascript
bench("div", { 
  style: { color: "red", marginTop: "10px" },
  "data-id": 123 
}, [])
```

### 5. Router & URL Control
We built a hash-based router. It listens to the URL and updates the application state (which page is valid) without reloading.

```javascript
// Switches content based on URL path
const router = new Router({
  '/': HomePage,
  '/about': AboutPage
});
```

### 6. Event Handling
We use **Event Delegation**. Instead of adding `addEventListener` to every button (which is slow), we add *one* listener to the root `#app` element. We intercept the event, find who caused it, and run your function.
- Prevents default behavior? Yes, handled in the dispatcher.
- Prevents bubbling? Yes, our dispatcher stops it if needed.

### 7. HTTP Requests
We wrote a helper class for `GET`, `POST`, `PUT`, `DELETE`.
```javascript
const data = await http.get('/api/todos');
```

---

## Best Practices

If you build with Dot.js, follow these rules:

1.  **Keep Components Small**: Break your UI into small, reusable chunks.
2.  **Use Unique Keys**: When making lists, always give each item a unique `key` prop. This helps our diffing algorithm know which items moved (crucial for performance!).
3.  **Don't Touch the DOM**: Let the framework handle `document` calls. Use `this.state` to change things.
4.  **Use Relative URLs**: When calling the backend, use `/api/...` so it works everywhere.

---

## Performance

We verified that the framework is fast.
- **Virtual List**: We built a component that only renders visible items. We tested this with **200,000 items** and it scrolls smoothly.
- **Efficient Diffing**: The `patch` function only updates the text node or attribute that actually changed.

---

## Project Structure

```
frontend-framework/
├── framework/              # The core library code
│   ├── common/             # Utilities (Component, http, etc.)
│   ├── dom/                # Rendering logic (bench, patch, mount)
│   ├── router/             # Routing logic
│   ├── state/              # State management (Store)
│   └── README.md           # Framework-specific docs
│
├── example/                # The Demo Applications
│   ├── src/                # Todo App source code
│   ├── calculatorExample/  # Simple Calculator demo
│   ├── backend/            # JSON data storage
│   ├── server.py           # Python server (Frontend + Backend)
│   └── index.html          # Entry point
│
└── README.md               # This file
```

---

## Team
- Kristen Järvala
- Kenet Jets
- Ruuben Kangur