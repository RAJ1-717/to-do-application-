# Taskflow — Week 2 Todo App with Express API

A responsive Todo application built with semantic HTML, CSS, vanilla browser JavaScript, Node.js and Express.

## Features
- Add, list, complete/incomplete and delete tasks
- All, Active and Completed filters
- Loading, empty, and error messages
- Responsive layout and visible keyboard focus
- REST API with JSON responses and validation
- Tasks live in a server-side in-memory array; restarting the server resets the list

## Requirements
- Node.js and npm installed
- A modern browser

## Run locally
1. Extract the project ZIP.
2. Open the extracted `week2_todo_app` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `npm install`.
5. Run `npm start`.
6. Open `http://localhost:3000` in your browser.

Keep the terminal running while using the app. Refreshing the page keeps tasks while the server is still running. Restarting the server clears them by design.

## API contract

| Method | Route | Purpose | Success status |
|---|---|---|---|
| GET | `/api/todos` | Return all tasks | 200 |
| POST | `/api/todos` | Create task from `{ "text": "..." }` | 201 |
| PATCH | `/api/todos/:id` | Update `text` and/or `completed` | 200 |
| DELETE | `/api/todos/:id` | Remove a task | 204 |

Invalid/blank task text returns `400`. Updating or deleting an unknown ID returns `404`.

Example task:
```json
{ "id": "1", "text": "Review Fetch", "completed": false }
```

## Project structure
```text
week2_todo_app/
├── package.json
├── server.js
├── README.md
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Testing checklist
- [ ] Add a task
- [ ] Try adding an empty task
- [ ] Mark a task complete and incomplete
- [ ] Filter All / Active / Completed
- [ ] Delete a task
- [ ] Refresh the page while server is running
- [ ] Stop and restart server to verify the in-memory reset behavior
- [ ] Check the layout on a narrow/mobile viewport
