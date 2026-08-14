import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { MOCK_ACCOUNTS } from "../mocks/users";
import { LoginPage } from "./LoginPage";

const [writer] = MOCK_ACCOUNTS;

// LoginPage needs a router and the auth provider around it, the same way the
// real app does, or its hooks have nothing to read.
function renderLoginPage() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("shows a message under each field when both are empty", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
  });

  it("rejects an email that is not a valid address", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), writer.password);
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("shows the sign-in error when the password is wrong", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), writer.user.email);
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      await screen.findByText(
        "That email and password do not match an account.",
      ),
    ).toBeInTheDocument();
  });

  it("disables the button while the sign-in is running", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), writer.user.email);
    await user.type(screen.getByLabelText("Password"), writer.password);
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();

    // Let the sign-in finish, so the test does not end mid-update.
    await screen.findByRole("button", { name: "Sign In" });
  });
});
