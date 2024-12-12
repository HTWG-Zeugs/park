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
 * Get the role name for a given role ID.
 * @param role_id The numeric ID of the role.
 * @returns The corresponding Role, or undefined if the ID is invalid.
 */
export function getRoleById(role_id: number): Role {
  const role = Object.values(Role).find((value) => value === role_id);
  if (role === undefined) {
    throw new Error(`Invalid role ID: ${role_id}`);
  }
  return role as Role;
}
