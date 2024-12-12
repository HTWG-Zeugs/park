import { User } from "../models/user";
import { Role } from "../models/role";
import { Repository } from "../repositories/repository";

/**
 * Handles interactions with the user repository.
 * @Elsper01
 */
export class UserService {
  private repo: Repository;

  /**
   * Creates a new instance of the UserService.
   * @param {Repository} repository The repository to use for interactions with the user data.
   */
  constructor(repository: Repository) {
    this.repo = repository;
  }

  /**
   * Gets a user by its id.
   * @param {number} userId The id of the user to get.
   * @returns Returns the user with the given id.
   */
  async getUser(userId: string): Promise<User> {
    const user = await this.repo.getUser(userId);
    return user;
  }

  /**
   * Sets the role of a user.
   * @param user User to set the role for.
   * @param role The new role of the user.
   */
  setUserRole(user: User, role: Role): void {
    this.repo.setUserRole(user, role);
  }

  /**
   * Deletes a user.
   * @param user The user to delete.
   */
  deleteUser(user: User): void {
    this.repo.deleteUser(user);
  }

  /**
   * Creates a new user.
   * @param user The user to create.
   */
  createUser(user: User): void {
    this.repo.createUser(user);
  }
}
