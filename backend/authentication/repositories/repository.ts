import { User } from "../models/user";
import { Role } from "../models/role";

/**
 * Interface for the repository that handles user data.
 * @Elsper01
 */
export interface Repository {
  getUser(userId: string): Promise<User>;
  setUserRole(user: User, role: Role): Promise<void>;
  deleteUser(user: User): Promise<void>;
  createUser(user: User): Promise<void>;
}
