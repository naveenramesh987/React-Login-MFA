import { ROLE_PERMISSIONS, type Permission, type User } from "../types/auth";

// Looks at the user's role in the permission table.
export function can(user: User, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}
