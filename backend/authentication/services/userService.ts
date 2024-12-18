import { User } from "../models/user";
import { Role } from "../models/role";
import { Repository } from "../repositories/repository";
import { CreateUserRequestObject } from "../../../shared/CreateUserRequestObject";

/**
 * Handles interactions with the user repository.
 * @Elsper01
 */
export class UserService {
  private static instance: UserService;
  private repo: Repository;

  /**
   * Creates a new instance of the UserService.
   * @param {Repository} repository The repository to use for interactions with the user data.
   */
  private constructor(repository: Repository) {
    this.repo = repository;
  }

  /**
   * Gets the single instance of the UserService.
   * @param {Repository} repository The repository to use for interactions with the user data.
   * @returns {UserService} The single instance of the UserService.
   */
  public static getInstance(repository: Repository): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(repository);
    }
    return UserService.instance;
  }

  /**
   * Gets a user by its id.
   * @param {number} userId The id of the user to get.
   * @returns Returns the user with the given id.
   */
  async getUser(signedInUser: User, userId: string): Promise<User> {
    // Solution Admin is allowed to query everyone
    if (signedInUser.role === Role.solution_admin) {
      return await this.repo.getUser(userId);
    } else {
      const userToGet = await this.repo.getUser(userId);
      // signed-in user role must be higher than the user to get and must be the same tenant
      if (signedInUser.role >= userToGet.role && signedInUser.tenantId === userToGet.tenantId) {
        return userToGet;
      } else {
        console.error("User not allowed to get user");
        throw new Error("User not found");
      }
    }
  }

  /**
   * Gets all users.
   * @returns Returns all users as array.
   */
    async getAllUsers(signedInUser: User): Promise<User[]> {
      // Solution Admin is allowed to query everyone
      if (signedInUser.role === Role.solution_admin) {
        return await this.repo.getAllUsers();
      } 
      // Tenant Admin is only allowed to query all users of his tenant
      else if (signedInUser.role === Role.tenant_admin) {
        return await this.repo.getAllTenantUsers(signedInUser.tenantId);
      } else {
        console.error("User not allowed to get any users");
        throw new Error("Unauthorized");
      }
    }

  /**
   * Sets the role of a user.
   * @param user User to set the role for.
   * @param role The new role of the user.
   */
  async setUserRole(signedInUser: User, user: User, role: Role): Promise<void> {
    if(signedInUser.role === Role.solution_admin) {
      await this.repo.setUserRole(user, role);
    } else {
      // signed-in user role must be higher than the user to set the role for and must be the same tenant
      if (signedInUser.role >= user.role && signedInUser.tenantId === user.tenantId) {
        await this.repo.setUserRole(user, role);
      } else {
        console.error("User not allowed to set role");
        throw new Error("User not allowed to set role");
      }
    }
  }

  /**
   * Deletes a user.
   * @param user The user to delete.
   */
  deleteUser(signedInUser: User, user: User): void {
    // Solution Admin is allowed to delete everyone
    if (signedInUser.role === Role.solution_admin) {
      this.repo.deleteUser(user);
    } else {
      // signed-in user role must be higher than the user to delete and must be the same tenant
      if (signedInUser.role >= user.role && signedInUser.tenantId === user.tenantId) {
        this.repo.deleteUser(user);
      } else {
        console.error("User not allowed to delete user");
        throw new Error("User not allowed to delete user");
      }
    }
  }

  /**
   * Creates a new user.
   * @param user The user to create.
   */
  async createUser(signedInUser: User, user: CreateUserRequestObject): Promise<void> {
    // Solution Admin is allowed to create users for every tenant
    if (signedInUser.role === Role.solution_admin) {
      await this.repo.createUser(user);
    } else {
      // signed user role must be higher than the user to create and must be the same tenant
      if (signedInUser.role >= user.role && signedInUser.tenantId === user.tenantId) {
        await this.repo.createUser(user);
      } else {
        console.error("User not allowed to create user");
        throw new Error("User not allowed to create user");
      }
    }
  }
}
