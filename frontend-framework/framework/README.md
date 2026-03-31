# Framework Core Documentation

This directory contains the source code for the custom frontend framework.

## Modules

### `common/`
General utilities used throughout the framework and applications.
- **`component.js`**: Base `Component` class providing lifecycle methods and state management.
- **`http.js`**: Wrapper around `fetch` for easy API calls.
- **`persistence.js`**: Helper for saving/loading state to localStorage.
- **`VirtualList.js`**: A high-performance component for rendering large lists.

### `dom/`
Modules interacting directly with the DOM.
- **`bench.js`**: The hyperscript function (`bench`) for creating Virtual DOM nodes.
- **`mount.js`**: Logic to mount Virtual DOM nodes to the real DOM, including diffing/patching strategies.
- **`patch.js`**: Handles diffing and updating the DOM efficiently.

### `router/`
- **`router.js`**: A client-side router implementation supporting hash-based navigation and dynamic parameters.

### `state/`
- **`store.js`**: A reactive `Store` implementation using the Observer pattern and JavaScript Proxies.

## Usage

See the root [README](../README.md) for full documentation, installation instructions, and examples.
