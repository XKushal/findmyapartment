# Auth Polish Design

## Goal

Polish the existing local credentials auth experience without adding new auth products such as OAuth, password reset, email verification, or account deletion.

## Scope

In scope:

- Redirect signed-in users away from `/login` and `/register` to the resolved callback URL.
- Preserve the existing safe callback URL behavior so external URLs still fall back to `/listings`.
- Make login and registration submission failures deterministic:
  - invalid credentials show `Email or password is incorrect.`
  - registration API errors show the API message when available
  - network or unexpected sign-in failures show a friendly retry message
- Disable auth form fields while submitting so users cannot edit duplicate in-flight submissions.
- Keep credentials auth, JWT sessions, and current route protections unchanged.

Out of scope:

- OAuth providers.
- Password reset.
- Email verification.
- Remember-me controls.
- Account deletion or profile security settings.

## User Experience

Signed-out users can still access `/login` and `/register`. If a signed-in user visits either page, the page redirects them to the sanitized callback URL. For example, `/login?callbackUrl=/profile` redirects to `/profile`, while an external callback still redirects to `/listings`.

Login and register forms keep their current layout. During submission, all inputs and the submit button are disabled. On recoverable failures, the form clears the progress notice, shows the relevant error, and returns to an editable state.

## Implementation Shape

Add server-side auth checks to the login and register pages using the existing `auth()` helper and `redirect()` from Next navigation.

Extract small client helpers in the login and register form modules for submission result normalization. The React components should use those helpers so tests can cover failure handling without needing a browser DOM test harness.

## Testing

Add focused tests for:

- `/login` redirects signed-in users to the safe callback URL.
- `/register` redirects signed-in users to the safe callback URL.
- login helper maps invalid credentials and thrown sign-in failures to friendly messages.
- register helper maps API failures, sign-in failures, and thrown network failures to friendly messages.
- form markup disables auth inputs while submitting where practical through component structure tests or helper coverage.

Run:

- `npm test`
- `npm run lint`
- `npm run build`

