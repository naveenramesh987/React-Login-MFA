# Access Portal — Login + MFA

A small authentication demo: sign in with an email and password, confirm a one-time code, and land on a protected screen whose actions depend on your role.


**Flow:** `Login → MFA → Protected screen`

---

## Technologies

| | |
|---|---|
| React | Builds the screens |
| TypeScript | Adds types to the code |
| Vite | Runs the dev server and builds the app |
| React Router | Handles the pages and who can visit them |
| CSS Modules | Styles each screen |
| Vitest and React Testing Library | Runs the tests |

---

## Setup

Requires Node 20 or newer.

```bash
git clone https://github.com/naveenramesh987/React-Login-MFA.git
npm install
```

---

## Running locally

```bash
npm run dev
```

Open **http://localhost:5173**.

---

## Mock users

Both accounts are also listed on the login screen.

| Email | Password | Role | Can do |
|---|---|---|---|
| `user1@example.com` | `password1` | read-write | View, activate, deactivate, delete |
| `user2@example.com` | `password2` | read-only | View only |

**One-time code: `123456`** for both accounts. It is shown on the code screen.

---

## How to test the login/MFA flow

**Read/write account**

1. Sign in as `user1@example.com` / `password1`
2. Enter `123456`
3. The dashboard loads with working Activate, Deactivate and Delete buttons

**Read-only account**

1. Sign out, then sign in as `user2@example.com` / `password2`, code `123456`
2. The same dashboard loads, but the buttons are faded and refuse to act, with a line above the table explaining why

**Validation and errors**

| Try this | Expected |
|---|---|
| Submit the login form empty | A message under each field, and red borders |
| Email `abc` | "Please enter a valid email address." |
| Password under 8 characters | The minimum length message |
| Wrong password | "That email and password do not match an account." |
| An email with no account | The same message as a wrong password |
| A code that is not 6 digits | A message, and no request is sent |
| A wrong code 3 times | The form is replaced by a way to start again |
| Type `/dashboard` while signed out | You are sent to `/login` |
| Refresh while signed in | You stay signed in |

---

## Key design decisions and assumptions

- **Sign-in has 3 stages: `idle`, `mfaRequired`, `authenticated`.** Each holds
  only its own data, so you cannot be half signed in.
- **The password alone does not sign you in.** Only the code step returns a user,
  so MFA cannot be skipped.
- **3 things keep the order.** The service rejects a fake or reused sign-in, the
  auth state will not check a code out of turn, and the route will not show
  a screen you have not reached.
- **Screens ask what you can do, not who you are.** They call
  `can(user, "write")` instead of checking the role, so changing what a role can
  do is one table edit.
- **Buttons are switched off, not hidden.** Read-only users can see editing
  exists. `aria-disabled` keeps them reachable by keyboard and lets the click
  through to the real permission check.
- **Errors are returned, not thrown.** Calls return `{ ok: true, data }` or
  `{ ok: false, errorCode }`, so the failure has to be handled first.
- **A wrong password and an unknown email say the same thing.** Otherwise the
  form tells you which emails have accounts.
- **Sign-in checks length, sign-up checks strength.** Demanding strength at
  sign-in only locks out older passwords and protects nothing.

**Assumptions**

- Two roles are enough to show access control working
- Registration is out of scope, so sign up checks everything and then stops

---

## Known limitations

- **None of this is real security.** Every check runs in the browser, and there
  is no server to check again.
- **The saved sign-in can be edited.** It is kept in `sessionStorage`, which
  anyone can change in devtools.
- **Passwords are compared as plain text.** A real app stores them scrambled.
- **A sign-in in progress never times out.** It works once and dies after 3 wrong
  codes, but nothing expires it.
- **The code is always `123456` and shown on screen.** Real MFA sends a new one.
- **The fake passwords are committed on purpose.** Secret scanners flag them,
  which is a false alarm.
- **Deep links need extra setup to deploy.** A host has to send unknown paths to
  `index.html`. The dev server already does.
- **Signing up does not create anything.** It checks every field, then says so.
- **Refreshing during the code step starts you over.** Only a finished sign-in is
  saved.
