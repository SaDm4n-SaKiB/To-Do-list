const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// In-memory data storage (replace with a database in a real-world scenario)
const users = [];
const todoLists = [];

// Middleware to check JWT token for authentication
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied.');

    jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
};

// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };
    users.push(user);
    res.status(201).send('User registered successfully.');
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(401).send('Invalid credentials.');
        const token = jwt.sign({ username: user.username }, 'secretKey');
        res.json({ token });
});

// User Profile Read
    app.get('/profile', authenticateToken, (req, res) => {
    res.json(req.user);
});

// User Profile Update
app.put('/profile', authenticateToken, (req, res) => {
    const { username } = req.user;
    const { newPassword } = req.body;

  // Update user in the in-memory storage (replace with database update)
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
    }

    res.send('Profile updated successfully.');
});

// User To-Do List Create
app.post('/todo', authenticateToken, (req, res) => {
    const { username } = req.user;
    const { task } = req.body;
    const todo = { username, task, completed: false };
    todoLists.push(todo);
    res.status(201).send('To-Do created successfully.');
});

// User To-Do List Read
    app.get('/todo', authenticateToken, (req, res) => {
    const { username } = req.user;
    const userTodos = todoLists.filter(todo => todo.username === username);
    res.json(userTodos);
});

// User To-Do List Update
app.put('/todo/:id', authenticateToken, (req, res) => {
    const { username } = req.user;
    const todoId = req.params.id;
    const { task, completed } = req.body;

    const userTodo = todoLists.find(todo => todo.username === username && todoId === todo.id);
    if (userTodo) {
        userTodo.task = task || userTodo.task;
        userTodo.completed = completed || userTodo.completed;
        res.send('To-Do updated successfully.');
    } else {
        res.status(404).send('To-Do not found.');
    }
});

// User To-Do List Delete
app.delete('/todo/:id', authenticateToken, (req, res) => {
    const { username } = req.user;
    const todoId = req.params.id;

    const todoIndex = todoLists.findIndex(todo => todo.username === username && todoId === todo.id);
    if (todoIndex !== -1) {
        todoLists.splice(todoIndex, 1);
        res.send('To-Do deleted successfully.');
    } else {
        res.status(404).send('To-Do not found.');
    }
});

// User To-Do List Complete/Cancel Mark
app.patch('/todo/:id', authenticateToken, (req, res) => {
    const { username } = req.user;
    const todoId = req.params.id;
    const { completed } = req.body;

    const userTodo = todoLists.find(todo => todo.username === username && todoId === todo.id);
    if (userTodo) {
        userTodo.completed = completed;
        res.send('To-Do marked as complete/cancel.');
    } else {
    res.status(404).send('To-Do not found.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
