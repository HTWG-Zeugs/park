import { User } from "../models/user";
import { Role, getRoleById } from "../models/role";
import { Repository } from "./repository";
import { readFileSync, writeFileSync } from "fs";

const USER_COLLECTION_PATH = "./../mocks/json_collections/users.json";

/**
 * Repository that reads and writes data to a JSON data collection.
 * @Elsper01
 */
export class JsonFileRepository implements Repository {

  getUser(userId: string): User {
    const data = readFileSync(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === userId);
    if (index !== -1) {
      return new User(
        jsonData[index].id,
        getRoleById(jsonData[index].role),
        jsonData[index].tenantId,
        jsonData[index].email
      );
    } else {
      throw new Error("User not found");
    }
  }

  setUserRole(user: User, role: Role): void {
    const data = readFileSync(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      jsonData[index].role = role.valueOf();
      writeFileSync(USER_COLLECTION_PATH, JSON.stringify(jsonData), "utf-8");
    } else {
      throw new Error("User not found");
    }
  }

  deleteUser(user: User): void {
    const data = readFileSync(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      jsonData.splice(index, 1);
      writeFileSync(USER_COLLECTION_PATH, JSON.stringify(jsonData), "utf-8");
    } else {
      throw new Error("User not found");
    }
  }

  createUser(user: User): void {
    try {
      const data = readFileSync(USER_COLLECTION_PATH, "utf-8");
      const jsonData = JSON.parse(data);
      jsonData.push({
        id: user.id,
        role: user.role.valueOf(),
        tenantId: user.tenantId,
        email: user.email,
      });
      writeFileSync(USER_COLLECTION_PATH, JSON.stringify(jsonData), "utf-8");
    } catch (err) {
      throw new Error("Error creating user");
    }
  }
}
