const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
let todos = [];
let nextId = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/todos", (req, res) => {
  res.status(200).json(todos);
});

app.post("/api/todos", (req, res) => {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "Task text cannot be empty." });
  }
  const todo = { id: String(nextId++), text, completed: false };
  todos.push(todo);
  return res.status(201).json(todo);
});

app.patch("/api/todos/:id", (req, res) => {
  const todo = todos.find(item => item.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "Task not found." });

  const hasText = Object.prototype.hasOwnProperty.call(req.body, "text");
  const hasCompleted = Object.prototype.hasOwnProperty.call(req.body, "completed");

  if (!hasText && !hasCompleted) {
    return res.status(400).json({ error: "Provide text and/or completed to update." });
  }
  if (hasText) {
    if (typeof req.body.text !== "string" || !req.body.text.trim()) {
      return res.status(400).json({ error: "Task text cannot be empty." });
    }
    todo.text = req.body.text.trim();
  }
  if (hasCompleted) {
    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({ error: "Completed must be true or false." });
    }
    todo.completed = req.body.completed;
  }
  return res.status(200).json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const index = todos.findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found." });
  todos.splice(index, 1);
  return res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Todo App running at http://localhost:${PORT}`);
});
