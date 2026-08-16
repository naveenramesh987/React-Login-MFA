import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth, type AuthState } from "../context/AuthContext";

// The screen each stage of signing in belongs on. Someone sent away from a
// page always lands on the one that matches how far they have actually got.
const HOME_FOR_STATUS: Record<AuthState["status"], string> = {
  idle: "/login",
  mfaRequired: "/mfa",
  authenticated: "/dashboard",
};

type RequireStatusProps = Readonly<{
  children: ReactNode;
  status: AuthState["status"];
}>;

// Shows the page only if the user has reached the right stage of signing in.
// If they have not, they are sent to the screen for the stage they are on.
export function RequireStatus({ children, status }: RequireStatusProps) {
  const { state } = useAuth();

  if (state.status !== status) {
    return <Navigate to={HOME_FOR_STATUS[state.status]} replace />;
  }

  // Returning children is what puts the page on screen. If the check above
  // redirected instead, the page never runs at all.
  return children;
}
