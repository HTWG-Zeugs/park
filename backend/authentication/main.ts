import { Repository } from "./repositories/repository";
import { FirestoreRepository } from "./repositories/firestoreRepository";
import { UserService } from "./services/userService";
import { Config } from "./config";
import validateFirebaseIdToken from "./middleware/validateFirebaseIdToken";
import { User } from "./models/user";
import cors from "cors";
import { CreateUserRequestObject } from "../../shared/CreateUserRequestObject";
import { EditUserRequestObject } from "../../shared/EditUserRequestObject";
import { TenantService } from "./services/tenantService";

const express = require("express");
const app = express();
const port = Config.PORT;

app.use(express.json());

app.use(cors());

const repo: Repository = FirestoreRepository.getInstance();
const userService: UserService = UserService.getInstance(repo);
const tenantService: TenantService = TenantService.getInstance(repo);

/**
 * Gets an user by ID.
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
 * Get all users.
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
 * Creates a new user.
 */
app.post("/user", validateFirebaseIdToken, async (req, res) => {
  const signedInUser: User = res.user;
  try {
    const userToCreate: CreateUserRequestObject = req.body;
    await userService.createUser(signedInUser, userToCreate);
    res.status(200).send("User created");
  } catch (e) {
    res.status(500).send("Creating user failed: " + e);
  }
});

/**
 * Updates user.
 */
app.put(
  "/user/:userId",
  validateFirebaseIdToken,
  async (req, res) => {
    // check if all parameters are valid
    const signedInUser: User = res.user;
    try {
      const userId: string = req.params.userId;
      const attributesToChange: EditUserRequestObject = req.body;
      let user: User;
      try {
        user = await userService.getUser(signedInUser, userId);
      } catch (e) {
        return res.status(404).send("User not found");
      }
      await userService.updateUser(signedInUser, user, attributesToChange);
      res.status(200).send("User updated");
    } catch (e) {
      res.status(500).send("Updating user failed: " + e);
    }
  }
);

/**
 * Deletes user.
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
 * Health checks the service.
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

/**
 * Gets the tenant ID for a given user.
 */
app.get("/tenant-id/:mail", async (req, res) => {
  if (!req.params.mail) {
    return res.status(400).send("Mail is required");
  }
  const mail = req.params.mail;
  try {
    await userService.getTenantId(mail).then((tenantInfo) => {
      res.status(200).send(tenantInfo);
    });
  } catch (e) {
    console.error(e);
    res.status(404).send("User not found");
  }
});


app.post("/tenants/add", (req, res) => {
  tenantService.createTenant(req.body)
  .then(() => {
    res.status(200).send("Tenant created");
  })
  .catch((error) => {
    console.log("Error creating tenant:", error);
    res.status(500).send("Error creating tenant");
  });
});


app.get("/livez", (req, res) => {
  res.status(200).send("Authentication service is running.");
});

app.listen(port, () => {
  console.log(`Authentication service listening on port ${port}.`);
});
