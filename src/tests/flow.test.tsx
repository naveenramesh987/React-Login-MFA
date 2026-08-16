import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { MOCK_ACCOUNTS, MOCK_OTP } from "../mocks/users";

const [writer, viewer] = MOCK_ACCOUNTS;

// Renders the whole app exactly as main.tsx does, including the real router and
// StrictMode. The other test files build their own route tables, so this is the
// only place App.tsx's own routing and guards are checked.
function renderApp() {
  render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
}

async function signIn(
  ui: ReturnType<typeof userEvent.setup>,
  account: (typeof MOCK_ACCOUNTS)[number],
) {
  await ui.type(await screen.findByLabelText("Email"), account.user.email);
  await ui.type(screen.getByLabelText("Password"), account.password);
  await ui.click(screen.getByRole("button", { name: "Sign In" }));

  await screen.findByRole("heading", { name: "Check your authenticator" });
  await ui.type(screen.getByLabelText("6-digit code"), MOCK_OTP);
  await ui.click(screen.getByRole("button", { name: "Verify" }));
}

describe("the whole app", () => {
  it("takes a read-write account from login through to the dashboard", async () => {
    const ui = userEvent.setup();
    renderApp();

    await signIn(ui, writer);

    expect(
      await screen.findByRole("heading", { name: "Resources" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your account can edit and delete resources."),
    ).toBeInTheDocument();
  });

  it("takes a read-only account to the same dashboard without the actions", async () => {
    const ui = userEvent.setup();
    renderApp();

    await signIn(ui, viewer);

    expect(
      await screen.findByRole("heading", { name: "Resources" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your account is read-only.")).toBeInTheDocument();
  });

  it("reaches the sign up screen from the login screen", async () => {
    const ui = userEvent.setup();
    renderApp();

    await ui.click(await screen.findByRole("link", { name: "Sign up" }));

    expect(
      screen.getByRole("heading", { name: "Create an account" }),
    ).toBeInTheDocument();
  });
});
