import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { MOCK_ACCOUNTS, MOCK_OTP } from "../mocks/users";
import { RequireStatus } from "../routes/RequireStatus";
import { DashboardPage } from "./DashboardPage";
import { LoginPage } from "./LoginPage";
import { MfaPage } from "./MfaPage";

const [writer, viewer] = MOCK_ACCOUNTS;

type Ui = ReturnType<typeof userEvent.setup>;
type Account = (typeof MOCK_ACCOUNTS)[number];

function renderFlow(initialPath = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/mfa"
            element={
              <RequireStatus status="mfaRequired">
                <MfaPage />
              </RequireStatus>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireStatus status="authenticated">
                <DashboardPage />
              </RequireStatus>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

// Goes through the real login and code screens so the dashboard has a genuine
// signed in user with a role.
async function signInAs(ui: Ui, account: Account) {
  await ui.type(screen.getByLabelText("Email"), account.user.email);
  await ui.type(screen.getByLabelText("Password"), account.password);
  await ui.click(screen.getByRole("button", { name: "Sign In" }));

  await screen.findByRole("heading", { name: "Check your authenticator" });
  await ui.type(screen.getByLabelText("6-digit code"), MOCK_OTP);
  await ui.click(screen.getByRole("button", { name: "Verify" }));

  await screen.findByRole("heading", { name: "Resources" });
}

describe("DashboardPage", () => {
  it("shows who is signed in", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, writer);

    expect(
      screen.getByText(
        `Signed in as ${writer.user.name} (${writer.user.email})`,
      ),
    ).toBeInTheDocument();
  });

  it("enables the actions for a read-write account", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, writer);

    expect(
      screen.getAllByRole("button", { name: "Delete" })[0],
    ).toHaveAttribute("aria-disabled", "false");
    expect(
      screen.getByText("Your account can edit and delete resources."),
    ).toBeInTheDocument();
  });

  it("disables the actions for a read-only account", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, viewer);

    expect(
      screen.getAllByRole("button", { name: "Delete" })[0],
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Your account is read-only.")).toBeInTheDocument();
  });

  it("lets a read-write account change a status", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, writer);

    const row = screen.getByRole("row", { name: /us-east-gateway/ });
    expect(within(row).getByText("active")).toBeInTheDocument();

    await ui.click(within(row).getByRole("button", { name: "Deactivate" }));

    expect(within(row).getByText("inactive")).toBeInTheDocument();
  });

  it("lets a read-write account delete a resource", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, writer);

    const row = screen.getByRole("row", { name: /eu-west-gateway/ });
    await ui.click(within(row).getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("eu-west-gateway")).not.toBeInTheDocument();
  });

  it("still refuses a read-only account that re-enables the button", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, viewer);

    const row = screen.getByRole("row", { name: /us-east-gateway/ });
    const button = within(row).getByRole("button", { name: "Deactivate" });

    // aria-disabled does not stop the click reaching the handler, which is the
    // point: the permission check inside the handler is what refuses it.
    fireEvent.click(button);

    expect(
      screen.getByText("Your account cannot make changes."),
    ).toBeInTheDocument();
    expect(within(row).getByText("active")).toBeInTheDocument();
  });

  it("refuses a delete from a read-only account", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, viewer);

    const row = screen.getByRole("row", { name: /us-east-gateway/ });
    fireEvent.click(within(row).getByRole("button", { name: "Delete" }));

    expect(
      screen.getByText("Your account cannot delete resources."),
    ).toBeInTheDocument();
    expect(screen.getByText("us-east-gateway")).toBeInTheDocument();
  });

  it("keeps the user signed in when the app is restarted", async () => {
    const ui = userEvent.setup();
    const { unmount } = renderFlow();
    await signInAs(ui, writer);

    // Tearing everything down and building it again is what a page refresh
    // does. The session is read back from storage on the way up.
    unmount();
    renderFlow("/dashboard");

    expect(
      await screen.findByRole("heading", { name: "Resources" }),
    ).toBeInTheDocument();
  });

  it("does not keep the user signed in after signing out", async () => {
    const ui = userEvent.setup();
    const { unmount } = renderFlow();
    await signInAs(ui, writer);
    await ui.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByRole("heading", { name: "Sign In" });

    unmount();
    renderFlow("/dashboard");

    expect(
      await screen.findByRole("heading", { name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("returns to the login screen when signing out", async () => {
    const ui = userEvent.setup();
    renderFlow();
    await signInAs(ui, writer);

    await ui.click(screen.getByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("heading", { name: "Sign In" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Resources" }),
    ).not.toBeInTheDocument();
  });

  it("allows signing in as a different account afterwards", async () => {
    const ui = userEvent.setup();
    renderFlow();

    await signInAs(ui, writer);
    expect(
      screen.getByText("Your account can edit and delete resources."),
    ).toBeInTheDocument();

    await ui.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByRole("heading", { name: "Sign In" });

    await signInAs(ui, viewer);
    expect(screen.getByText("Your account is read-only.")).toBeInTheDocument();
  });
});
