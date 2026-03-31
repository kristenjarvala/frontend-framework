import { Component } from "../../../framework/common/component.js";
import { bench } from "../../../framework/dom/bench.js";
import { VirtualList } from "../../../framework/common/VirtualList.js";
import { http } from "../../../framework/common/http.js";
import { store } from "../store.js";

// Import sub-components
import { TodoHeader } from "./TodoHeader.js";
import { TodoInput } from "./TodoInput.js";
import { TodoFilters } from "./TodoFilters.js";
import { TodoStats } from "./TodoStats.js";

/**
 * TodoList Component ("Controller" Component)
 * Manages state and data, delegates UI to sub-components.
 */
export class TodoList extends Component {
  constructor(props) {
    super(props);

    // Initialize state
    const initialFilter = this.props.params && this.props.params.status
      ? this.props.params.status
      : "all";

    this.state = {
      todos: [],
      inputValue: "",
      filter: initialFilter,
      loading: true,
      error: null,
    };

    // Subscribe to global store for theming
    store.subscribe(() => this.reRender());

    // Load todos from backend
    this.loadTodos();
  }

  /**
   * Fetch todos from the backend
   */
  async loadTodos() {
    try {
      console.log("Loading todos from backend...");
      this.state.loading = true;
      this.state.error = null;

      const todos = await http.get("/api/todos");

      // Update state with loaded todos
      this.state.todos = todos;
      this.state.loading = false;
      this.state.error = null;

      console.log("Loaded", todos.length, "todos from backend");
    } catch (error) {
      console.error("Failed to load todos:", error);
      this.state.loading = false;
      this.state.error = "Could not load todos. Is the backend running?";
    }
  }

  /**
   * Add a new todo
   */
  async addTodo() {
    const { inputValue } = this.state;
    if (!inputValue.trim()) return;

    try {
      const newTodo = {
        text: inputValue.trim(),
        done: false,
      };

      console.log("Creating todo:", this.state.inputValue);

      const tempId = Date.now();
      const optimisticTodo = { ...newTodo, id: tempId };
      this.state.todos = [...this.state.todos, optimisticTodo];
      this.state.inputValue = ""; // Clear input immediately

      // Send to backend
      const createdTodo = await http.post("/api/todos", newTodo);

      console.log("Todo created:", createdTodo);

      this.state.todos = this.state.todos.map(t =>
        t.id === tempId ? createdTodo : t
      );

    } catch (error) {
      console.error("Failed to create todo:", error);
      this.loadTodos();
      alert("Failed to save todo!");
    }
  }

  /**
   * Toggle todo status
   */
  async toggleTodo(id) {
    try {
      const todo = this.state.todos.find((t) => t.id === id);
      if (!todo) return;

      console.log("Toggling todo:", id);

      // Optimistic update
      todo.done = !todo.done;
      this.state.todos = [...this.state.todos];

      // Send to backend
      const updated = await http.put(`/api/todos/${id}`, todo);

      console.log("Todo toggled:", updated);

    } catch (error) {
      console.error("Failed to toggle todo:", error);
      this.loadTodos(); // Revert
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id) {
    try {
      console.log("Deleting todo:", id);

      // Optimistic update
      this.state.todos = this.state.todos.filter((t) => t.id !== id);

      // Send to backend
      await http.delete(`/api/todos/${id}`);

      console.log("Todo deleted:", id);

    } catch (error) {
      console.error("Failed to delete todo:", error);
      this.loadTodos(); // Revert
    }
  }

  handleInput(event) {
    this.state.inputValue = event.target.value;
  }

  setFilter(filter) {
    this.state.filter = filter;
    // Update URL to match filter
    window.location.hash = `#/filter/${filter}`;
  }

  getFilteredTodos() {
    const { todos, filter } = this.state;
    if (filter === "active") return todos.filter((todo) => !todo.done);
    if (filter === "completed") return todos.filter((todo) => todo.done);
    return todos;
  }

  retryLoad() {
    this.loadTodos();
  }

  render() {
    const { loading, error, inputValue, filter, todos } = this.state;

    // Loading State
    if (loading) {
      return bench("div", { className: "todo-container" }, [
        bench(TodoHeader, { theme: store.state.theme, onToggleTheme: () => { } }),
        bench("div", { className: "loading-spinner" }, [
          bench("p", {}, ["Loading..."]),
        ]),
      ]);
    }

    // Error State
    if (error) {
      return bench("div", { className: "todo-container" }, [
        bench(TodoHeader, { theme: store.state.theme, onToggleTheme: () => { } }),
        bench("div", { className: "error-banner" }, [
          bench("p", {}, [`Error: ${error}`]),
          bench("button", { className: "add-button", onClick: () => this.retryLoad() }, ["Retry"]),
        ]),
      ]);
    }

    const filteredTodos = this.getFilteredTodos();
    const activeTodosCount = todos.filter((t) => !t.done).length;
    const completedTodosCount = todos.filter((t) => t.done).length;

    const isDark = store.state.theme === 'dark';
    const containerClass = `todo-container${isDark ? ' theme-dark' : ''}`;

    // Apply theme to body
    if (isDark) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }

    return bench("div", { className: containerClass }, [
      // 1. Header
      bench(TodoHeader, {
        theme: store.state.theme,
        onToggleTheme: () => {
          store.state.theme = store.state.theme === 'dark' ? 'light' : 'dark';
        }
      }),

      // 2. Input
      bench(TodoInput, {
        value: inputValue,
        onInput: (e) => this.handleInput(e),
        onAdd: () => this.addTodo()
      }),

      // 3. Filters
      bench(TodoFilters, {
        currentFilter: filter,
        onSetFilter: (f) => this.setFilter(f)
      }),

      // 4. Todo List
      filteredTodos.length === 0
        ? bench("div", { className: "empty-state" }, [
          bench("p", {}, ["No todos here!"]),
        ])
        : bench(VirtualList, {
          items: filteredTodos,
          height: 400,
          itemHeight: 60,
          renderRow: (todo) => bench(
            "div",
            {
              key: todo.id,
              className: todo.done ? "todo-item done" : "todo-item",
              style: { height: '60px', boxSizing: 'border-box', display: 'flex', alignItems: 'center' }
            },
            [
              bench("input", {
                type: "checkbox",
                className: "todo-checkbox",
                checked: todo.done,
                onClick: () => this.toggleTodo(todo.id),
              }),
              bench("span", { className: "todo-text" }, [todo.text]),
              bench("button", {
                className: "delete-button",
                onClick: () => this.deleteTodo(todo.id),
              }, ["×"]),
            ],
          )
        }),

      // 5. Stats
      bench(TodoStats, {
        total: todos.length,
        active: activeTodosCount,
        done: completedTodosCount
      }),
    ]);
  }
}
