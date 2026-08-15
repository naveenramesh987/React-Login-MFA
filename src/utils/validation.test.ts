import { describe, expect, it } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  OTP_LENGTH,
  validateEmail,
  validateName,
  validateNewPassword,
  validateOtp,
  validatePassword,
  validatePasswordConfirmation,
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

describe("validateOtp", () => {
  it("accepts six digits", () => {
    expect(validateOtp("123456")).toBeUndefined();
  });

  it("ignores spaces around the code", () => {
    expect(validateOtp("  123456  ")).toBeUndefined();
  });

  it("asks for a value when the field is empty", () => {
    expect(validateOtp("")).toBe("Code is required.");
    expect(validateOtp("     ")).toBe("Code is required.");
  });

  it.each(["12a456", "abcdef", "12-456"])(
    "rejects %s because it is not all numbers",
    (badCode) => {
      expect(validateOtp(badCode)).toBe(
        "The code should only contain numbers.",
      );
    },
  );

  it.each(["12345", "1234567"])("rejects %s as the wrong length", (badCode) => {
    expect(validateOtp(badCode)).toBe(
      `The code should be ${OTP_LENGTH} digits.`,
    );
  });
});

describe("validateNewPassword", () => {
  // Built from MIN_PASSWORD_LENGTH so these stay correct if it changes.
  const validPassword = "a".repeat(MIN_PASSWORD_LENGTH - 1) + "1";
  const oneCharShort = "a".repeat(MIN_PASSWORD_LENGTH - 2) + "1";

  it("accepts a password with letters and numbers", () => {
    expect(validateNewPassword(validPassword)).toBeUndefined();
  });

  it("asks for a value when the field is empty", () => {
    expect(validateNewPassword("")).toBe("Password is required.");
  });

  it("rejects one character short of the minimum", () => {
    expect(validateNewPassword(oneCharShort)).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    );
  });

  it("rejects a password with no letters", () => {
    expect(validateNewPassword("1".repeat(MIN_PASSWORD_LENGTH))).toBe(
      "Password must include at least one letter.",
    );
  });

  it("rejects a password with no numbers", () => {
    expect(validateNewPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(
      "Password must include at least one number.",
    );
  });
});

describe("validatePasswordConfirmation", () => {
  it("accepts two identical passwords", () => {
    expect(
      validatePasswordConfirmation("same-value", "same-value"),
    ).toBeUndefined();
  });

  it("asks for a value when the field is empty", () => {
    expect(validatePasswordConfirmation("same-value", "")).toBe(
      "Please type your password again.",
    );
  });

  it("rejects two different passwords", () => {
    expect(validatePasswordConfirmation("one-value", "another-value")).toBe(
      "The passwords do not match.",
    );
  });
});

describe("validateName", () => {
  it("accepts a name", () => {
    expect(validateName("Riley Chen")).toBeUndefined();
  });

  it("rejects a name that is only spaces", () => {
    expect(validateName("   ")).toBe("Name is required.");
  });
});
