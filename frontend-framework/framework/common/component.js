import { Store } from "../state/store.js";
import { mount } from "../dom/mount.js";
import { patch } from "../dom/patch.js";

/**
 * Base Component class that all components should extend.
 * Provides reactive state management and automatic re-rendering.
 *
 * @example
 * class TodoList extends Component {
 *     constructor() {
 *         super();
 *         this.state = { todos: [] };
 *     }
 *
 *     addTodo(text) {
 *         this.state.todos = [...this.state.todos, { id: Date.now(), text }];
 *         // Automatically re-renders!
 *     }
 *
 *     render() {
 *         return bench('div', {}, [
 *             bench('h1', {}, ['My Todos']),
 *             bench('ul', {},
 *                 this.state.todos.map(todo =>
 *                     bench('li', {}, [todo.text])
 *                 )
 *             )
 *         ]);
 *     }
 * }
 */
export class Component {
  constructor(props = {}) {
    // Store instance for reactive state
    this._store = null;

    // Container element where component is mounted
    this._container = null;

    // Flag to prevent infinite re-render loops
    this._isRendering = false;

    // Virtual node for the component
    this._vnode = null;

    // Props for the component
    this.props = props;
  }

  /**
   * Get the component's reactive state
   * @returns {Proxy} The reactive state object
   */
  get state() {
    if (!this._store) {
      // Initialize with empty state if not set yet
      this._store = new Store({});

      // Subscribe to state changes to trigger re-renders
      this._store.subscribe(() => {
        this.reRender();
      });
    }
    return this._store.state;
  }

  /**
   * Set the component's initial state
   * Called when you do: this.state = { count: 0 }
   * @param {Object} initialState - The initial state object
   */
  set state(initialState) {
    // Create a new Store with the initial state
    this._store = new Store(initialState);

    // Subscribe to re-render on any state changes
    this._store.subscribe(() => {
      this.reRender();
    });
  }

  /**
   * Render method - MUST be overridden by child classes
   * Should return a virtual node created with bench()
   *
   * @returns {Object} Virtual node
   * @throws {Error} If not implemented by child class
   */
  render() {
    throw new Error(`${this.constructor.name} must implement render() method`);
  }

  /**
   * Mount this component to a DOM container
   * @param {HTMLElement|string} container - DOM element or selector string
   */
  mountTo(container) {
    // Handle string selectors like '#app'
    if (typeof container === "string") {
      this._container = document.querySelector(container);
    } else {
      this._container = container;
    }

    // Perform initial render
    this.reRender();
  }

  /**
   * Re-render the component
   * Called automatically when state changes
   * Can also be called manually if needed
   */
  reRender() {
    // Prevent infinite render loops
    if (this._isRendering) {
      console.warn(
        `${this.constructor.name}: Already rendering, skipping re-render`,
      );
      return;
    }

    // Can't render without a container
    if (!this._container) {
      console.warn(`${this.constructor.name}: No container set, cannot render`);
      return;
    }

    this._isRendering = true;

    try {
      // Get the virtual node from child's render method
      const newVnode = this.render();

      if (this._vnode) {
        patch(this._vnode, newVnode);
      } else {
        this._container.innerHTML = "";
        mount(newVnode, this._container);
      }

      this._vnode = newVnode;
    } catch (error) {
      console.error(`Error rendering ${this.constructor.name}:`, error);

      // Show error in UI for debugging
      this._container.innerHTML = `
                <div style="
                    color: #e74c3c;
                    padding: 1rem;
                    border: 2px solid #e74c3c;
                    border-radius: 4px;
                    background: #fadbd8;
                    font-family: monospace;
                ">
                    <strong>Render Error in ${this.constructor.name}:</strong><br>
                    ${error.message}
                </div>
            `;
    } finally {
      this._isRendering = false;
    }
  }

  update() {
    const newVnode = this.render();
    patch(this._vnode, newVnode);
    this._vnode = newVnode;
  }
}
