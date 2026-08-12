import type { User } from "../types/auth";
import { MOCK_ACCOUNTS, MOCK_OTP } from "../mocks/users";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "INVALID_CODE"
  | "CHALLENGE_EXPIRED"
  | "TOO_MANY_ATTEMPTS";

export interface MfaChallenge {
  challengeId: string;
  email: string;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: AuthErrorCode };

const NETWORK_DELAY_MS = 600;
const MAX_OTP_ATTEMPTS = 3;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pendingChallenges = new Map<
  string,
  { email: string; attempts: number }
>();

// Step 1: Verify the password and create an MFA challenge.
// A successful password check does not sign the user in yet.
export async function login(
  email: string,
  password: string,
): Promise<Result<MfaChallenge>> {
  await delay(NETWORK_DELAY_MS);

  const account = MOCK_ACCOUNTS.find(
    (acc) => acc.user.email.toLowerCase() === email.trim().toLowerCase(),
  );

  // A wrong password and an email nobody owns give the exact same error, so
  // this form cannot be used to find out which emails are registered.
  if (account?.password !== password) {
    return { ok: false, errorCode: "INVALID_CREDENTIALS" };
  }

  const challengeId = crypto.randomUUID();
  pendingChallenges.set(challengeId, {
    email: account.user.email,
    attempts: 0,
  });

  return { ok: true, data: { challengeId, email: account.user.email } };
}

// Step 2: Verify the MFA code and complete sign-in.
export async function verifyOtp(
  challengeId: string,
  otp: string,
): Promise<Result<User>> {
  await delay(NETWORK_DELAY_MS);

  const challenge = pendingChallenges.get(challengeId);
  if (!challenge) {
    return { ok: false, errorCode: "CHALLENGE_EXPIRED" };
  }

  if (otp !== MOCK_OTP) {
    challenge.attempts++;

    // Delete the challenge after 3 failed attempts.
    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      pendingChallenges.delete(challengeId);
      return { ok: false, errorCode: "TOO_MANY_ATTEMPTS" };
    }

    return { ok: false, errorCode: "INVALID_CODE" };
  }

  // Delete the challenge after successfully signing in.
  pendingChallenges.delete(challengeId);

  const account = MOCK_ACCOUNTS.find(
    (acc) => acc.user.email.toLowerCase() === challenge.email.toLowerCase(),
  );
  if (!account) {
    return { ok: false, errorCode: "INVALID_CREDENTIALS" };
  }

  return { ok: true, data: account.user };
}
