const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const addButton = document.querySelector("#add-button");
const list = document.querySelector("#todo-list");
const statusMessage = document.querySelector("#status-message");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const remainingCount = document.querySelector("#remaining-count");
const totalLabel = document.querySelector("#total-label");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = [...document.querySelectorAll(".filter")];

let todos = [];
let currentFilter = "all";
let busy = false;

function setStatus(message = "", isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function visibleTodos() {
  if (currentFilter === "active") return todos.filter(todo => !todo.completed);
  if (currentFilter === "completed") return todos.filter(todo => todo.completed);
  return todos;
}

function render() {
  list.replaceChildren();
  const visible = visibleTodos();
  const remaining = todos.filter(todo => !todo.completed).length;
  remainingCount.textContent = remaining;
  totalLabel.textContent = `${todos.length} ${todos.length === 1 ? "task" : "tasks"}`;
  clearCompletedButton.disabled = !todos.some(todo => todo.completed);
  clearCompletedButton.style.opacity = clearCompletedButton.disabled ? ".45" : "1";

  emptyState.hidden = visible.length !== 0;
  if (visible.length === 0) {
    if (todos.length && currentFilter === "completed") {
      emptyTitle.textContent = "Nothing completed yet";
      emptyCopy.textContent = "Finished tasks will show up here.";
    } else if (todos.length && currentFilter === "active") {
      emptyTitle.textContent = "All caught up!";
      emptyCopy.textContent = "You’ve completed every task. Nice work.";
    } else {
      emptyTitle.textContent = "A fresh start";
      emptyCopy.textContent = "Add your first task above and build some momentum.";
    }
  }

  visible.forEach(todo => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;

    const check = document.createElement("button");
    check.type = "button";
    check.className = "check-button";
    check.textContent = todo.completed ? "✓" : "";
    check.setAttribute("aria-label", todo.completed ? `Mark ${todo.text} incomplete` : `Mark ${todo.text} complete`);
    check.setAttribute("aria-pressed", String(todo.completed));
    check.addEventListener("click", () => updateTodo(todo.id, { completed: !todo.completed }));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = todo.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${todo.text}`);
    remove.addEventListener("click", () => deleteTodo(todo.id));

    item.append(check, text, remove);
    list.append(item);
  });
}

async function loadTodos() {
  setStatus("Loading your tasks…");
  try {
    todos = await api("/api/todos");
    render();
    setStatus("");
  } catch (error) {
    setStatus(`${error.message}. Make sure the server is running, then refresh.`, true);
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    setStatus("Please enter a task before adding it.", true);
    input.focus();
    return;
  }
  if (busy) return;
  busy = true;
  addButton.disabled = true;
  setStatus("Adding task…");
  try {
    const created = await api("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text })
    });
    todos.push(created);
    input.value = "";
    currentFilter = "all";
    updateFilterButtons();
    render();
    setStatus("Task added.");
    input.focus();
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    busy = false;
    addButton.disabled = false;
  }
});

async function updateTodo(id, changes) {
  setStatus("Updating task…");
  try {
    const updated = await api(`/api/todos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(changes)
    });
    todos = todos.map(todo => todo.id === id ? updated : todo);
    render();
    setStatus("Task updated.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function deleteTodo(id) {
  setStatus("Deleting task…");
  try {
    await api(`/api/todos/${encodeURIComponent(id)}`, { method: "DELETE" });
    todos = todos.filter(todo => todo.id !== id);
    render();
    setStatus("Task deleted.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function updateFilterButtons() {
  filterButtons.forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    render();
  });
});

clearCompletedButton.addEventListener("click", async () => {
  const completed = todos.filter(todo => todo.completed);
  if (!completed.length) return;
  setStatus("Clearing completed tasks…");
  try {
    for (const todo of completed) {
      await api(`/api/todos/${encodeURIComponent(todo.id)}`, { method: "DELETE" });
    }
    todos = todos.filter(todo => !todo.completed);
    render();
    setStatus("Completed tasks cleared.");
  } catch (error) {
    await loadTodos();
    setStatus(error.message, true);
  }
});

loadTodos();
