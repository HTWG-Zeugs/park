import { Role } from "./role";

/**
 * Represents a user of the system.
 * @Elsper01
 */
export class User {
  id: string;
  role: Role;
  name: string;
  tenantId: string;
  mail: string;

  /**
   * Creates a new instance of the User class.
   * @param {string} id The unique identifier of the user.
   * @param {Role} role The role of the user.
   * @param {string} tenantId The id of the tenant the user belongs to.
   * @param {string} mail The mail address of the user.
   * @param {string} name The name of the user.
   */
  constructor(id: string, role: Role, tenantId: string, mail: string, name: string) {
    this.id = id;
    this.role = role;
    this.name = name;
    this.tenantId = tenantId;
    this.mail = mail;
  }

  /**
   *  Converts the user to a plain object. Required for Firestore.
   * @returns Returns a plain object representation of the user.
   */
  toPlainObject() {
    return {
      id: this.id,
      role: this.role,
      tenantId: this.tenantId,
      mail: this.mail,
      name: this.name,
    };
  }
}
