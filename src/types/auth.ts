export type Role = "read-only" | "read-write"
export type Permission = "read" | "write" | "delete"

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "read-only": ["read"],
  "read-write": ["read", "write", "delete"],
}