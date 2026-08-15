import { describe, expect, it } from "vitest";
import { MOCK_ACCOUNTS } from "../mocks/users";
import { can } from "./permissions";

const [writer, viewer] = MOCK_ACCOUNTS;

describe("can", () => {
  it("lets a read-write user read, write, and delete", () => {
    expect(can(writer.user, "read")).toBe(true);
    expect(can(writer.user, "write")).toBe(true);
    expect(can(writer.user, "delete")).toBe(true);
  });

  it("lets a read-only user read", () => {
    expect(can(viewer.user, "read")).toBe(true);
  });

  it("stops a read-only user writing or deleting", () => {
    expect(can(viewer.user, "write")).toBe(false);
    expect(can(viewer.user, "delete")).toBe(false);
  });
});
