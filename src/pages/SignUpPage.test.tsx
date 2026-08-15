import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SignUpPage } from "./SignUpPage";

function renderSignUpPage() {
  render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  );
}

describe("SignUpPage", () => {
  it("shows a message under every field when the form is empty", async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Please type your password again."),
    ).toBeInTheDocument();
  });

  it("rejects a password with no number in it", async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText("Full name"), "Riley Chen");
    await user.type(screen.getByLabelText("Email"), "riley@example.com");
    await user.type(screen.getByLabelText("Password"), "passwords");
    await user.type(screen.getByLabelText("Confirm password"), "passwords");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      screen.getByText("Password must include at least one number."),
    ).toBeInTheDocument();
  });

  it("rejects two passwords that do not match", async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText("Full name"), "Riley Chen");
    await user.type(screen.getByLabelText("Email"), "riley@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.type(screen.getByLabelText("Confirm password"), "password2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("The passwords do not match.")).toBeInTheDocument();
  });

  it("confirms success without creating an account", async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText("Full name"), "Riley Chen");
    await user.type(screen.getByLabelText("Email"), "riley@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.type(screen.getByLabelText("Confirm password"), "password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText(/no account was created/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create account" }),
    ).not.toBeInTheDocument();
  });
});
