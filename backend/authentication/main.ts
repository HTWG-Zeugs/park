import { JsonFileRepository } from "./repositories/jsonFileRepository";
import { Repository } from "./repositories/repository";
import { UserService } from "./services/userService";
import { Config } from "./config";

const express = require('express');
const app = express();
const port = Config.PORT;

app.use(express.json());

const repo: Repository = new JsonFileRepository();
const userService: UserService = new UserService(repo);

// TODO: Add authentication middleware
app.get('/user/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const user = userService.getUser(userId);
        res.status(200).send(user);
    } catch (e) {
        res.status(500).send('Getting user failed: ' + e);
    }
});

app.post('/user', (req, res) => {
    try {
        const user = req.body;
        userService.createUser(user);
        res.status(200).send('User created');
    } catch (e) {
        res.status(500).send('Creating user failed: ' + e);
    }
});

app.put('/user/:userId/role/:role', (req, res) => {
    try {
        const userId = req.params.userId;
        const role = req.params.role;
        userService.setUserRole(userId, role);
        res.status(200).send('User role updated');
    } catch (e) {
        res.status(500).send('Setting user role failed: ' + e);
    }
});

app.delete('/user/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        userService.deleteUser(userId);
        res.status(200).send('User deleted');
    } catch (e) {
        res.status(500).send('Deleting user failed: ' + e);
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('Authentication service is running.');
});

app.get("/help", (req, res) => {
    res.status(200).send(`
        <h1>Authentication Service API</h1>
        <p>GET /user/:userId - Get user by ID</p>
        <p>POST /user - Create a new user</p>
        <p>PUT /user/:userId/role/:role - Set user role</p>
        <p>DELETE /user/:userId - Delete user</p>
        <p>GET /health - Check service health</p>
        `);
});

app.listen(port, () => {
    console.log(`Authentication service listening on port ${port}.`);
});