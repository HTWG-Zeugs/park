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
   * @inheritdoc
   */
  async updateUser(user: User): Promise<void> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex((u: User) => u.id === user.id);
    if (index !== -1) {
      jsonData[index] = {
        id: user.id,
        role: user.role.valueOf(),
        tenantId: user.tenantId,
        tenantType: user.tenantType,
        mail: user.mail,
        name: user.name,
      };
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
  async getTenantIdAndType(mail: string): Promise<{ tenantId: string, tenantType: string }> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    const user = jsonData.find((u: any) => u.mail === mail);
    if (user) {
      return {tenantId: user.tenantId, tenantType: user.tenantType};
    } else {
      throw new Error("User not found");
    }
  }
  
  /**
   * @inheritdoc
   */
  async getAllUsers(): Promise<User[]> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData.map((u: any) => new User(u.id, getRoleById(u.role), u.tenantId, u.tenantType, u.mail, u.name));
  }

  /**
   * @inheritdoc
   */
  async getAllTenantUsers(tenantId: string): Promise<User[]> {
    const data = await promises.readFile(USER_COLLECTION_PATH, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData
      .filter((u: any) => u.tenantId === tenantId)
      .map((u: any) => new User(u.id, getRoleById(u.role), u.tenantId, u.tenantType, u.mail, u.name));
  }

  /**
   * @inheritdoc
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
        jsonData[index].tenantType,
        jsonData[index].mail,
        jsonData[index].name
      );
      return userToGet;
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
        tenantType: user.tenantType,
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
