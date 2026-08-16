import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { RequireStatus } from "./RequireStatus";

// Starts at the given path with nobody signed in, which is what a visitor
// typing the address by hand would get.
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<h1>Login</h1>} />
          <Route
            path="/mfa"
            element={
              <RequireStatus status="mfaRequired">
                <h1>Code</h1>
              </RequireStatus>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireStatus status="authenticated">
                <h1>Dashboard</h1>
              </RequireStatus>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("RequireStatus", () => {
  it("keeps a signed out visitor away from the dashboard", () => {
    renderAt("/dashboard");

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a visitor who has not signed in away from the code screen", () => {
    renderAt("/mfa");

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Code" }),
    ).not.toBeInTheDocument();
  });
});
