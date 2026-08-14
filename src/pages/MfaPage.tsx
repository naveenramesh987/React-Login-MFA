import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OTP_LENGTH, validateOtp } from "../utils/validation";
import { ERROR_MESSAGES } from "../utils/authMessages";
import { MOCK_OTP } from "../mocks/users";
import styles from "../styles/authForm.module.css";
import mfaStyles from "./MfaPage.module.css";

export function MfaPage() {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mustStartAgain, setMustStartAgain] = useState(false);
  const { state, verifyMfa, logout } = useAuth();
  const navigate = useNavigate();
  const email = state.status === "mfaRequired" ? state.challenge.email : "";

  function startAgain() {
    logout();
    navigate("/login");
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextOtpError = validateOtp(otp);
    setOtpError(nextOtpError);

    if (nextOtpError) {
      return;
    }

    setIsSubmitting(true);
    const result = await verifyMfa(otp.trim());
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(ERROR_MESSAGES[result.errorCode]);

      // A wrong code can be retyped. Anything else means the sign-in attempt
      // is finished for good, so the form is no longer any use.
      setMustStartAgain(result.errorCode !== "INVALID_CODE");
      return;
    }

    navigate("/dashboard");
  }

  // The screen itself. It normally shows the code form, but once the sign-in
  // attempt has ended it shows the error and a button to start again.
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Check your authenticator</h1>
          <p className={styles.subtitle}>Enter the 6-digit code for {email}.</p>
        </div>

        {mustStartAgain ? (
          <>
            <p className={styles.formError} role="alert">
              {formError}
            </p>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={startAgain}
            >
              Back to sign in
            </button>
          </>
        ) : (
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="otp">
                6-digit code
              </label>
              <input
                className={`${styles.input} ${mfaStyles.otpInput}`}
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                aria-invalid={Boolean(otpError)}
                aria-describedby={otpError ? "otp-error" : undefined}
              />
              {otpError && (
                <p className={styles.error} id="otp-error" role="alert">
                  {otpError}
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
              {isSubmitting ? "Checking…" : "Verify"}
            </button>

            <p className={styles.hint}>For this demo, the code is {MOCK_OTP}.</p>
          </form>
        )}
      </div>
    </main>
  );
}
