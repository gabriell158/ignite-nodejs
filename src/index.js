const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (user) {
    request["user"] = user;
    return next();
  }
  return response.status(404).send({
    error: "Mensagem do erro",
  });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  if (users.find((user) => user.username === username))
    return response.status(400).send({
      error: "Usuario ja existe",
    });
  users.push(newUser);
  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  return response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  const index = users.findIndex((user) => user.username === username);
  if (index !== -1) {
    users[index]["todos"].push(newTodo);

    return response.status(201).send(newTodo);
  }
  return response.status(400).send({ error: "error" });
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userIndex = users.findIndex((user) => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1)
    return response.status(404).send({ error: "todo not found" });

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = deadline;

  return response.send(users[userIndex].todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex((user) => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1)
    return response.status(404).send({ error: "todo not found" });

  users[userIndex].todos[todoIndex].done = true;

  return response.send(users[userIndex].todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex((user) => user.username === username);

  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1)
    return response.status(404).send({ error: "todo not found" });

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send("ok");
});

module.exports = app;
