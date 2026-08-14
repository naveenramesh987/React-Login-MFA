import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validatePassword,
} from "./validation";

describe("validateEmail", () => {
  it("accepts a normal address", () => {
    expect(validateEmail("user1@example.com")).toBeUndefined();
  });

  it("ignores spaces around the address", () => {
    expect(validateEmail("   user1@example.com   ")).toBeUndefined();
  });

  it("asks for a value when the box is empty", () => {
    expect(validateEmail("")).toBe("Email is required.");
    expect(validateEmail("     ")).toBe("Email is required.");
  });

  it.each([
    "user1",
    "user1@",
    "@example.com",
    "user1@example",
    "user 1@example.com",
  ])("rejects %s", (badEmail) => {
    expect(validateEmail(badEmail)).toBe("Please enter a valid email address.");
  });
});

describe("validatePassword", () => {
  it("accepts a password of exactly the minimum length", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH))).toBeUndefined();
  });

  it("rejects one character short of the minimum", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    );
  });

  it("asks for a value when the box is empty", () => {
    expect(validatePassword("")).toBe("Password is required.");
  });

  it("counts spaces as real characters and never trims them", () => {
    expect(validatePassword("  secret  ")).toBeUndefined();
  });
});
