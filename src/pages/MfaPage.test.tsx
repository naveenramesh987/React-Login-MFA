import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { MOCK_ACCOUNTS, MOCK_OTP } from "../mocks/users";
import { LoginPage } from "./LoginPage";
import { MfaPage } from "./MfaPage";

const [writer] = MOCK_ACCOUNTS;

type User = ReturnType<typeof userEvent.setup>;

function renderFlow() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mfa" element={<MfaPage />} />
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Signs in for real, so the code screen has a live challenge to work with.
async function reachMfaScreen(user: User) {
  await user.type(screen.getByLabelText("Email"), writer.user.email);
  await user.type(screen.getByLabelText("Password"), writer.password);
  await user.click(screen.getByRole("button", { name: "Sign In" }));
  await screen.findByRole("heading", { name: "Check your authenticator" });
}

async function submitCode(user: User, code: string) {
  const codeField = screen.getByLabelText("6-digit code");
  await user.clear(codeField);
  await user.type(codeField, code);
  await user.click(screen.getByRole("button", { name: "Verify" }));
}

describe("MfaPage", () => {
  it("shows which account is being verified", async () => {
    const user = userEvent.setup();
    renderFlow();
    await reachMfaScreen(user);

    expect(
      screen.getByText(`Enter the 6-digit code for ${writer.user.email}.`),
    ).toBeInTheDocument();
  });

  it("rejects a code that is not six digits without calling the service", async () => {
    const user = userEvent.setup();
    renderFlow();
    await reachMfaScreen(user);

    await submitCode(user, "123");

    expect(
      screen.getByText("The code should be 6 digits."),
    ).toBeInTheDocument();
  });

  it("shows an error for a wrong code and keeps the form", async () => {
    const user = userEvent.setup();
    renderFlow();
    await reachMfaScreen(user);

    await submitCode(user, "000000");

    expect(
      await screen.findByText("That code is not correct."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
  });

  it("goes to the dashboard when the code is right", async () => {
    const user = userEvent.setup();
    renderFlow();
    await reachMfaScreen(user);

    await submitCode(user, MOCK_OTP);

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("replaces the form after three wrong codes", async () => {
    const user = userEvent.setup();
    renderFlow();
    await reachMfaScreen(user);

    await submitCode(user, "000000");
    await screen.findByRole("button", { name: "Verify" });
    await submitCode(user, "000000");
    await screen.findByRole("button", { name: "Verify" });
    await submitCode(user, "000000");

    expect(
      await screen.findByRole("button", { name: "Back to sign in" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Verify" }),
    ).not.toBeInTheDocument();
  });
});
