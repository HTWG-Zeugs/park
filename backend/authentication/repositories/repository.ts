import { User } from "../models/user";
import { Role } from "../models/role";

/**
 * Interface for the repository that handles user data.
 * @Elsper01
 */
export interface Repository {
  getUser(userId: string): User;
  setUserRole(user: User, role: Role): void;
  deleteUser(user: User): void;
  createUser(user: User): void;
}
