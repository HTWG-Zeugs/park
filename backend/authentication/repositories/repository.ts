import { User } from "../models/user";
import { Role } from "../models/role";

/**
 * Interface for the repository that handles user data.
 * @Elsper01
 */
export interface Repository {
  /**
   * Gets a user by its id.
   * @param userId The id of the user to get.
   * @returns Returns instance of the user with the given id.
   */
  getUser(userId: string): Promise<User>;

  /**
   * Sets the role of a user.
   * @param user User to set the role for.
   * @param role The new role of the user.
   */
  setUserRole(user: User, role: Role): Promise<void>;

  /**
   * Deletes a user.
   * @param user The user to delete.
   */
  deleteUser(user: User): Promise<void>;

  /**
   * Creates a new user.
   * @param user The user to create.
   */
  createUser(user: User): Promise<void>;
}
