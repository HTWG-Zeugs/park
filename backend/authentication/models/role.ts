import { UserRoleObject } from "../../../shared/UserRoleObject";

/**
 * Enum for the different roles a user can have.
 * @Elsper01
 */
export enum Role {
  // admin of all tenants
  solution_admin = UserRoleObject.solution_admin,
  // admin of a tenant instance
  tenant_admin = UserRoleObject.tenant_admin,
  // staff of a tenant
  operational_manager = UserRoleObject.operational_manager,
  // customer of a tenant
  customer = UserRoleObject.customer,
  // third party software, e.g. a payment provider that needs to access the data of a tenant customer
  third_party = UserRoleObject.third_party,
}

/**
 * Get the Role for a given numeric ID.
 * @param roleId The numeric ID of the role.
 * @returns The corresponding Role, or undefined if the ID is invalid.
 */
export function getRoleById(roleId: number): Role | undefined {
  const role = Object.values(Role).find((value) => value === roleId);
  return role as Role | undefined;
}
