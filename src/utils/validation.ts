const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;
export const OTP_LENGTH = 6;

// Checks what was typed in the email field and returns a message to show the
// user, or nothing when the email is valid.
export function validateEmail(email: string): string | undefined {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return "Email is required.";
  }
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return "Please enter a valid email address.";
  }
  return undefined;
}

// Same for the password field. Only checks it is long enough, never how strong
// it is, because the password already exists by the time someone logs in.
export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  return undefined;
}

// Same for the code field. The code must be exactly 6 digits, and nothing
// else is accepted.
export function validateOtp(otp: string): string | undefined {
  const trimmedOtp = otp.trim();
  if (!trimmedOtp) {
    return "Code is required.";
  }
  if (!/^\d+$/.test(trimmedOtp)) {
    return "The code should only contain numbers.";
  }
  if (trimmedOtp.length !== OTP_LENGTH) {
    return `The code should be ${OTP_LENGTH} digits.`;
  }
  return undefined;
}