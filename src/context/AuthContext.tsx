import {
  login,
  verifyOtp,
  type MfaChallenge,
  type Result,
} from "../services/authService";
import type { User } from "../types/auth";
import { clearStoredUser, readStoredUser, storeUser } from "../utils/session";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type AuthState =
  | { status: "idle" }
  | { status: "mfaRequired"; challenge: MfaChallenge }
  | { status: "authenticated"; user: User };

interface AuthContextValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<Result<MfaChallenge>>;
  verifyMfa: (code: string) => Promise<Result<User>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// How screens read the sign-in state. Throwing here turns "I forgot to add the
// provider" into an obvious error instead of a confusing crash later.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Picks up a user saved earlier in this tab, so refreshing the page does not
// sign anyone out. Runs once, when the provider first appears.
function initialState(): AuthState {
  const user = readStoredUser();
  return user ? { status: "authenticated", user } : { status: "idle" };
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>(initialState);

  // useMemo stops this object being rebuilt on every render, which would make
  // every screen using useAuth re-render for no reason.
  const value = useMemo<AuthContextValue>(
    () => ({
      state,

      // Step 1. The state only moves forward if the password was right, so a
      // failed attempt leaves the user exactly where they were.
      signIn: async (email: string, password: string) => {
        const result = await login(email, password);
        if (result.ok) {
          setState({ status: "mfaRequired", challenge: result.data });
        }
        return result;
      },

      // Step 2. Only runs when the password step has already passed, because
      // that is the one state holding the challenge the code is checked against.
      verifyMfa: async (code: string) => {
        if (state.status !== "mfaRequired") {
          return { ok: false, errorCode: "CHALLENGE_EXPIRED" };
        }

        const result = await verifyOtp(state.challenge.challengeId, code);
        if (result.ok) {
          storeUser(result.data);
          setState({ status: "authenticated", user: result.data });
        }
        return result;
      },

      // Throws away the signed-in user and sends everything back to the start.
      logout: () => {
        clearStoredUser();
        setState({ status: "idle" });
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
