// backend/server.js
// Simple Express server for Todo CRUD operations

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON bodies

// Data file path
const DATA_FILE = path.join(__dirname, "todos.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({
      todos: [
        { id: 1, text: "Walk the dog", done: false },
        { id: 2, text: "Water the plants", done: false },
        { id: 3, text: "Sand the chairs", done: true },
      ],
    }),
  );
}

// Helper function to read todos
function readTodos() {
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(data);
}

// Helper function to write todos
function writeTodos(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// API ENDPOINTS
// ============================================

// GET /api/todos - Get all todos
app.get("/api/todos", (req, res) => {
  try {
    const data = readTodos();
    console.log("GET /api/todos - Returning", data.todos.length, "todos");
    res.json(data.todos);
  } catch (error) {
    console.error("Error reading todos:", error);
    res.status(500).json({ error: "Failed to read todos" });
  }
});

// POST /api/todos - Create a new todo
app.post("/api/todos", (req, res) => {
  try {
    const { text, done } = req.body;

    if (!text || text.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Text must be at least 3 characters" });
    }

    const data = readTodos();
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      done: done || false,
    };

    data.todos.push(newTodo);
    writeTodos(data);

    console.log("POST /api/todos - Created:", newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT /api/todos/:id - Update a todo
app.put("/api/todos/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { text, done } = req.body;

    const data = readTodos();
    const todoIndex = data.todos.findIndex((t) => t.id === id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Update todo
    if (text !== undefined) data.todos[todoIndex].text = text;
    if (done !== undefined) data.todos[todoIndex].done = done;

    writeTodos(data);

    console.log(
      "PUT /api/todos/" + id + " - Updated:",
      data.todos[todoIndex],
    );
    res.json(data.todos[todoIndex]);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const data = readTodos();
    const todoIndex = data.todos.findIndex((t) => t.id === id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const deleted = data.todos.splice(todoIndex, 1)[0];
    writeTodos(data);

    console.log("DELETE /api/todos/" + id + " - Deleted:", deleted);
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Todo API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log("");
  console.log("Todo API Server running!");
  console.log("URL: http://localhost:" + PORT);
  console.log("");
  console.log("Available endpoints:");
  console.log("  GET    /api/todos       - Get all todos");
  console.log("  POST   /api/todos       - Create a todo");
  console.log("  PUT    /api/todos/:id   - Update a todo");
  console.log("  DELETE /api/todos/:id   - Delete a todo");
  console.log("  GET    /api/health      - Health check");
  console.log("");
});