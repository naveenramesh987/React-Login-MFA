import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import {
  validateEmail,
  validateName,
  validateNewPassword,
  validatePasswordConfirmation,
} from "../utils/validation";
import styles from "../styles/authForm.module.css";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmation?: string;
};

export function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isDone, setIsDone] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    // Stops the browser from reloading the page, which is the default.
    event.preventDefault();

    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    };
    setErrors(nextErrors);

    // If any field has a problem, stop here and let the user fix it.
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    // If we get here, all fields are valid. Show the confirmation.
    setIsDone(true);
  }

  // The screen itself. It shows the form, or a confirmation once every field
  // has passed its checks.
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>
            This is a demo, so new accounts aren't saved.
          </p>
        </div>

        {isDone ? (
          <>
            <p className={styles.subtitle} role="alert">
              Thanks, {name.trim()}. Everything is valid, but this is a demo,
              so no account was created.
            </p>
            <Link className={styles.linkButton} to="/login">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <form className={styles.form} noValidate onSubmit={handleSubmit}>
              {/* Name field. Each field holds a label, an input, and the
                  message shown underneath when that input is wrong. */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Full name
                </label>
                <input
                  className={styles.input}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p className={styles.error} id="name-error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email field, checked for a valid email address. */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-email">
                  Email
                </label>
                <input
                  className={styles.input}
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "signup-email-error" : undefined
                  }
                />
                {errors.email && (
                  <p
                    className={styles.error}
                    id="signup-email-error"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field, checked for length, a letter, and a number. */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-password">
                  Password
                </label>
                <input
                  className={styles.input}
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "signup-password-error" : undefined
                  }
                />
                {errors.password && (
                  <p
                    className={styles.error}
                    id="signup-password-error"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm new password is the same as the password above. */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmation">
                  Confirm password
                </label>
                <input
                  className={styles.input}
                  id="confirmation"
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  aria-invalid={Boolean(errors.confirmation)}
                  aria-describedby={
                    errors.confirmation ? "confirmation-error" : undefined
                  }
                />
                {errors.confirmation && (
                  <p
                    className={styles.error}
                    id="confirmation-error"
                    role="alert"
                  >
                    {errors.confirmation}
                  </p>
                )}
              </div>

              <button className={styles.button} type="submit">
                Create account
              </button>
            </form>

            <p className={styles.footer}>
              Already have an account?{" "}
              <Link className={styles.link} to="/login">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
