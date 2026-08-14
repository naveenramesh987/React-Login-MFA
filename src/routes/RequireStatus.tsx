import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth, type AuthState } from "../context/AuthContext";

type RequireStatusProps = Readonly<{
  children: ReactNode;
  status: AuthState["status"];
  redirectTo: string;
}>;

// Shows the page only if the user has reached the right stage of signing in.
// If they have not, they get sent back to the login screen instead.
export function RequireStatus({
  children,
  status,
  redirectTo,
}: RequireStatusProps) {
  const { state } = useAuth();
  if (state.status !== status) {
    return <Navigate to={redirectTo} replace />;
  }
  // Returning children is what puts the page on screen. If the check above
  // redirected instead, the page never runs at all.
  return children;
}
