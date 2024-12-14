import { User } from "../models/user";
import { Role, getRoleById } from "../models/role";
import { Repository } from "./repository";
import { promises } from "fs";

const USER_COLLECTION_PATH = "./mocks/json_collections/users.json";

/**
 * Repository that stores user data in a JSON file.
 * @Elsper01
 */
export class JsonFileRepository implements Repository {
  private static instance: JsonFileRepository;

  private constructor() {}

  /**
   * Gets the singleton instance of the repository.
   * @returns Returns the singleton instance.
   */
  public static getInstance(): JsonFileRepository {
    if (!JsonFileRepository.instance) {
      JsonFileRepository.instance = new JsonFileRepository();
    }
    return JsonFileRepository.instance;
  }

  /**
   * Gets a user by its id.
   * @param userId The id of the user to get.
   * @returns Returns instance of the user with the given id.
   */
  async getUser(userId: string): Promise<User> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === userId);
    if (index !== -1) {
      const userToGet = new User(
        jsonData[index].id,
        getRoleById(jsonData[index].role),
        jsonData[index].tenantId,
        jsonData[index].email
      );
      return userToGet;
    } else {
      throw new Error("User not found");
    }
  }

  /**
   * Sets the role of a user.
   * @param user User to set the role for.
   * @param role The new role of the user.
   */
  async setUserRole(user: User, role: Role): Promise<void> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      jsonData[index].role = role;
      await promises.writeFile(
        USER_COLLECTION_PATH,
        JSON.stringify(jsonData),
        "utf-8"
      );
    } else {
      throw new Error("User not found");
    }
  }

  /**
   * Deletes a user.
   * @param user The user to delete.
   */
  async deleteUser(user: User): Promise<void> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      jsonData.splice(index, 1);
      await promises.writeFile(
        USER_COLLECTION_PATH,
        JSON.stringify(jsonData),
        "utf-8"
      );
    } else {
      throw new Error("User not found");
    }
  }

  /**
   * Creates a new user.
   * @param user The user to create.
   */
  async createUser(user: User): Promise<void> {
    try {
      const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
      const jsonData = JSON.parse(data);
      jsonData.push({
        id: user.id,
        role: user.role.valueOf(),
        tenantId: user.tenantId,
        email: user.email,
      });
      await promises.writeFile(
        USER_COLLECTION_PATH,
        JSON.stringify(jsonData),
        "utf-8"
      );
    } catch (err) {
      throw new Error("Error creating user");
    }
  }
}
