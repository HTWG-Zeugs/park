import { Role } from "./role";

/**
 * Represents a user of the system.
 * @Elsper01
 */
export class User {
  id: string;
  role: Role;
  tenantId: string;
  email: string;

  /**
   * Creates a new instance of the User class.
   * @param {string} id The unique identifier of the user.
   * @param {Role} role The role of the user.
   * @param {string} tenantId The id of the tenant the user belongs to.
   * @param {string} email The email address of the user.
   */
  constructor(id: string, role: Role, tenantId: string, email: string) {
    this.id = id;
    this.role = role;
    this.tenantId = tenantId;
    this.email = email;
  }
}
