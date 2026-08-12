import { describe, expect, it } from "vitest";
import { login, verifyOtp } from "./authService";
import { MOCK_ACCOUNTS, MOCK_OTP } from "../mocks/users";

const [writer, viewer] = MOCK_ACCOUNTS;

async function newChallenge(account = writer) {
  const result = await login(account.user.email, account.password);
  if (!result.ok) throw new Error("login fixture failed");
  return result.data.challengeId;
}

describe("login", () => {
  it("returns a challenge for valid credentials", async () => {
    const result = await login(writer.user.email, writer.password);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.email).toBe(writer.user.email);
    expect(result.data.challengeId).toBeTruthy();
  });

  it("rejects a wrong password", async () => {
    const result = await login(writer.user.email, "wrong-password");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errorCode).toBe("INVALID_CREDENTIALS");
  });

  it("rejects an unknown email", async () => {
    const result = await login("nobody@example.com", writer.password);

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errorCode).toBe("INVALID_CREDENTIALS");
  });

  it("gives an identical error for a wrong password and an unknown email", async () => {
    const wrongPassword = await login(writer.user.email, "wrong-password");
    const unknownEmail = await login("nobody@example.com", writer.password);

    expect(wrongPassword).toEqual(unknownEmail);
  });

  it("accepts an email with surrounding whitespace and different casing", async () => {
    const messy = `  ${writer.user.email.toUpperCase()}  `;
    const result = await login(messy, writer.password);

    expect(result.ok).toBe(true);
  });
});

describe("verifyOtp", () => {
  it("returns the user for a correct code", async () => {
    const challengeId = await newChallenge();
    const result = await verifyOtp(challengeId, MOCK_OTP);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.email).toBe(writer.user.email);
    expect(result.data.role).toBe("read-write");
    expect(result.data).not.toHaveProperty("password");
  });

  it("carries the read-only role through for the viewer account", async () => {
    const challengeId = await newChallenge(viewer);
    const result = await verifyOtp(challengeId, MOCK_OTP);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.role).toBe("read-only");
  });

  it("rejects an unknown challenge", async () => {
    const result = await verifyOtp("not-a-real-challenge", MOCK_OTP);

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errorCode).toBe("CHALLENGE_EXPIRED");
  });

  it("rejects a wrong code", async () => {
    const challengeId = await newChallenge();
    const result = await verifyOtp(challengeId, "000000");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errorCode).toBe("INVALID_CODE");
  });

  it("consumes the challenge so a code cannot be replayed", async () => {
    const challengeId = await newChallenge();

    const first = await verifyOtp(challengeId, MOCK_OTP);
    const second = await verifyOtp(challengeId, MOCK_OTP);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (second.ok) return;

    expect(second.errorCode).toBe("CHALLENGE_EXPIRED");
  });

  it("blocks the challenge after three wrong codes", async () => {
    const challengeId = await newChallenge();

    await verifyOtp(challengeId, "000000");
    await verifyOtp(challengeId, "000000");
    const third = await verifyOtp(challengeId, "000000");

    expect(third.ok).toBe(false);
    if (third.ok) return;
    expect(third.errorCode).toBe("TOO_MANY_ATTEMPTS");

    const afterLockout = await verifyOtp(challengeId, MOCK_OTP);
    expect(afterLockout.ok).toBe(false);
  });
});
