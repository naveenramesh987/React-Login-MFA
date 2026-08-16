import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL does not auto-clean when `globals` is on for some runners; be explicit.
// sessionStorage is cleared too, so a signed in user from one test cannot leak
// into the next one.
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
