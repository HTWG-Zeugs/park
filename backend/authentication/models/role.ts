/**
 * Enum for the different roles a user can have.
 * @Elsper01
 */
export enum Role {
  // admin of a tenant instance
  tenant_admin = 100,
  // admin of all tenants
  solution_admin = 200,
  // staff of a tenant
  operational_manager = 300,
  // customer of a tenant
  customer = 400,
  // third party software, e.g. a payment provider that needs to access the data of a tenant customer
  third_party = 500,
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
