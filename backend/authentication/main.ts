import { Repository } from "./repositories/repository";
import { FirestoreRepository } from "./repositories/firestoreRepository";
import { UserService } from "./services/userService";
import { Config } from "./config";
import { getRoleById } from "./models/role";
import validateFirebaseIdToken from "./middleware/validateFirebaseIdToken";
import { User } from "./models/user";
import { Role } from "./models/role";

const express = require("express");
const app = express();
const port = Config.PORT;

app.use(express.json());

const repo: Repository = FirestoreRepository.getInstance();
const userService: UserService = UserService.getInstance(repo);

/**
 * Get a user by ID.
 */
app.get("/user/:userId", validateFirebaseIdToken, async (req, res) => {
  const signedInUser: User = res.user;
  try {
    let userToGet: User;
    const userId: string = req.params.userId;
    userToGet = await userService.getUser(signedInUser, userId);
    res.status(200).send(userToGet);
  } catch (e) {
    res.status(404).send("User not found");
  }
});

/**
 * Get a user by ID.
 */
app.get("/all-users", validateFirebaseIdToken, async (req, res) => {
  const signedInUser: User = res.user;
  try {
    const users = await userService.getAllUsers(signedInUser);
    res.status(200).send(users);
  } catch (e) {
    res.status(404).send("User not found");
  }
});

/**
 * Create a new user.
 */
app.post("/user", validateFirebaseIdToken, async (req, res) => {
  const signedInUser: User = res.user;
  try {
    const userToCreate: User = req.body;
    await userService.createUser(signedInUser, userToCreate);
    res.status(200).send("User created");
  } catch (e) {
    res.status(500).send("Creating user failed: " + e);
  }
});

/**
 * Set user role.
 */
app.put(
  "/user/:userId/role/:role",
  validateFirebaseIdToken,
  async (req, res) => {
    // check if all parameters are valid
    const signedInUser: User = res.user;
    try {
      const userId: string = req.params.userId;
      let user: User;
      try {
        user = await userService.getUser(signedInUser, userId);
      } catch (e) {
        return res.status(404).send("User not found");
      }
      let roleId: number = parseInt(req.params.role, 10);
      if (isNaN(roleId)) {
        return res.status(400).send("Invalid role ID");
      }
      const role: Role = getRoleById(roleId);

      // all roles are valid, now set the role
      await userService.setUserRole(signedInUser, user, role);
      res.status(200).send("User role updated");
    } catch (e) {
      res.status(500).send("Setting user role failed: " + e);
    }
  }
);

/**
 * Delete user.
 */
app.delete("/user/:userId", validateFirebaseIdToken, async (req, res) => {
  const signedInUser: User = res.user;
  try {
    const userId = req.params.userId;
    let user;
    try {
      user = await userService.getUser(signedInUser, userId);
    } catch (e) {
      return res.status(404).send("User not found");
    }
    try {
      await userService.deleteUser(signedInUser, user);
    } catch (e) {
      return res.status(403).send("Not allowed to delete user");
    }
    await userService.deleteUser(signedInUser, user);
    res.status(200).send("User deleted");
  } catch (e) {
    res.status(500).send("Deleting user failed: " + e);
  }
});

/**
 * Health check the service.
 */
app.get("/health", validateFirebaseIdToken, (req, res) => {
  res.status(200).send("Authentication service is running.");
});

/**
 * Help page.
 */
app.get("/help", validateFirebaseIdToken, (req, res) => {
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
