import { useState, type SubmitEvent } from "react";
import { validateEmail, validatePassword } from "../utils/validation";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/authForm.module.css";
import { ERROR_MESSAGES } from "../utils/authMessages";
import { MOCK_ACCOUNTS } from "../mocks/users";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page, which is the default.
    event.preventDefault();
    setFormError(undefined);

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    // If either field has a problem, stop here and let the user fix it.
    if (nextErrors.email || nextErrors.password) {
      return;
    }

    // Switch the button off while we wait, so it cannot be pressed twice, then
    // check the email and password. This takes about half a second.
    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    // The email and password were wrong, so show why and stay on this screen.
    if (!result.ok) {
      setFormError(ERROR_MESSAGES[result.errorCode]);
      return;
    }

    navigate("/mfa");
  }

  // The login screen itself. Each input field shows whatever is currently in
  // state, and typing in a field updates that state.
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sign In</h1>
        </div>

        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p className={styles.error} id="email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p className={styles.error} id="password-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <button
            className={styles.button}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Demo only. A real sign-in screen would never list credentials. */}
        <div className={styles.hint}>
          Demo accounts:
          <ul className={styles.hintList}>
            {MOCK_ACCOUNTS.map(({ user, password }) => (
              <li key={user.id}>
                {user.email} / {password} ({user.role})
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link className={styles.link} to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
