import { User } from "../models/user";
import { Role, getRoleById } from "../models/role";
import { Repository } from "./repository";
import { promises } from "fs";
import { CreateUserRequestObject } from "../../../shared/CreateUserRequestObject";
import { v4 as uuidv4 } from 'uuid';


const USER_COLLECTION_PATH = "./mocks/json_collections/users.json";

/**
 * Repository that stores user data in a JSON file.
 * @Elsper01
 */
export class JsonFileRepository implements Repository {
  private static instance: JsonFileRepository;

  private constructor() {}

  /**
   * Gets the tenant ID for a specific user by their email.
   * @param mail The email of the user.
   * @returns Returns a promise that resolves to the tenant ID.
   */
  async getTenantId(mail: string): Promise<string> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const user = jsonData.find((u: any) => u.mail === mail);
    if (user) {
      return user.tenantId;
    } else {
      throw new Error("User not found");
    }
  }
  
  /**
   * Gets all users from the JSON file.
   * @returns Returns a promise that resolves to an array of users.
   */
  async getAllUsers(): Promise<User[]> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData.map((u: any) => new User(u.id, getRoleById(u.role), u.tenantId, u.mail, u.name));
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
      .map((u: any) => new User(u.id, getRoleById(u.role), u.tenantId, u.mail, u.name));
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
        jsonData[index].mail,
        jsonData[index].name
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
  async createUser(user: CreateUserRequestObject): Promise<void> {
    try {
      const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
      const jsonData = JSON.parse(data);
      jsonData.push({
        id: uuidv4(),
        role: user.role.valueOf(),
        tenantId: user.tenantId,
        mail: user.mail,
        name: user.name,
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
