import { describe, expect, it } from "vitest";
import { MOCK_ACCOUNTS } from "../mocks/users";
import {
  clearStoredUser,
  readStoredUser,
  STORAGE_KEY,
  storeUser,
} from "./session";

const [writer] = MOCK_ACCOUNTS;

describe("session storage", () => {
  it("reads back a user that was stored", () => {
    storeUser(writer.user);

    expect(readStoredUser()).toEqual(writer.user);
  });

  it("returns nothing when nobody is stored", () => {
    expect(readStoredUser()).toBeNull();
  });

  it("forgets the user after clearing", () => {
    storeUser(writer.user);
    clearStoredUser();

    expect(readStoredUser()).toBeNull();
  });

  it("ignores a stored value that is not valid JSON", () => {
    sessionStorage.setItem(STORAGE_KEY, "not json at all");

    expect(readStoredUser()).toBeNull();
  });

  it("ignores a stored value that is not an object at all", () => {
    sessionStorage.setItem(STORAGE_KEY, "123");

    expect(readStoredUser()).toBeNull();
  });

  it("ignores a stored user missing the fields we need", () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email: "a@b.com" }));

    expect(readStoredUser()).toBeNull();
  });

  it("ignores a stored user whose role is not one we know", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...writer.user, role: "superuser" }),
    );

    expect(readStoredUser()).toBeNull();
  });
});
