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
   * Gets all users from the JSON file.
   * @returns Returns a promise that resolves to an array of users.
   */
  async getAllUsers(): Promise<User[]> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData.map((u: any) => new User(u.id, getRoleById(u.role), u.tenantId, u.email));
  }

  /**
   * Gets all users for a specific tenant from the JSON file.
   * @param tenantId The tenant ID to filter users by.
   * @returns Returns a promise that resolves to an array of users.
   */
  async getAllTenantUsers(tenantId: string): Promise<User[]> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData
      .filter((u: any) => u.tenantId === tenantId)
      .map((u: any) => new User(u.id, getRoleById(u.role), u.tenantId, u.email));
  }

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
   * @inheritdoc
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
    }
  }

  /**
   * @inheritdoc
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
   * @inheritdoc
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
   * @inheritdoc
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
