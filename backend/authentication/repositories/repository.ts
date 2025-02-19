import { User } from "../models/user";
import { Role } from "../models/role";
import { CreateUserRequestObject } from "../../../shared/CreateUserRequestObject";

/**
 * Interface for the repository that handles user data.
 * @Elsper01
 */
export interface Repository {
  /**
   * Gets all users of all tenants.
   * @returns Returns a array of all users.
   */
  getAllUsers(): Promise<User[]>;

  /**
   * Gets all users of a tenant.
   * @param tenantId The id of the tenant to get the users for.
   * @returns Returns a array of all users.
   */
  getAllTenantUsers(tenantId: string): Promise<User[]>;

  /**
   * Gets a user by its id.
   * @param userId The id of the user to get.
   * @returns Returns instance of the user with the given id.
   */
  getUser(userId: string): Promise<User>;

  /**
   * Updates the user.
   * @param user User with the updated values.
   */
  updateUser(user: User): Promise<void>;

  /**
   * Deletes a user.
   * @param user The user to delete.
   */
  deleteUser(user: User): Promise<void>;

  /**
   * Creates a new user.
   * @param user The user to create.
   */
  createUser(user: CreateUserRequestObject): Promise<void>;

  /**
   * Gets tenant_id of a mail.
   * @param mail mail to get the tenant_id for.
   */
  getTenantIdAndType(mail: string): Promise<{ tenantId: string, tenantType: string }>;
}
