import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "./AuthContext";

describe("useAuth", () => {
  it("throws a clear error when there is no provider above it", () => {
    // React prints the error it is about to throw. Hide it so the test output
    // stays readable.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    function Broken() {
      useAuth();
      return null;
    }

    expect(() => render(<Broken />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    consoleError.mockRestore();
  });
});
