import type { AuthErrorCode } from "../services/authService";

export const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "That email and password do not match an account.",
  INVALID_CODE: "That code is not correct.",
  CHALLENGE_EXPIRED: "Your sign-in timed out. Please start again.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please sign in again.",
};
