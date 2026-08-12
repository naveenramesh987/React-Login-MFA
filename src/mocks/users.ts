import type { User } from "../types/auth";

export const MOCK_OTP = "123456";

export interface MockAccount {
  user: User;
  password: string;
}

export const MOCK_ACCOUNTS: readonly MockAccount[] = [
  {
    user: {
      id: "1",
      email: "user1@example.com",
      name: "User 1",
      role: "read-write",
    },
    password: "password1",
  },
  {
    user: {
      id: "2",
      email: "user2@example.com",
      name: "User 2",
      role: "read-only",
    },
    password: "password2",
  },
];
