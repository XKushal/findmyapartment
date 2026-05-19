# Auth Foundation Design

Date: 2026-05-18

## Goal

Add email/password authentication to the Next.js migration so users can create accounts, sign in locally, and own listing writes. This replaces the temporary local-only API guard with real session and ownership checks.

## Scope

This slice covers:

- credentials-based registration with email, name, and password;
- credentials-based login through Auth.js / NextAuth;
- password hashing with `bcryptjs`;
- Prisma user fields for password auth;
- server-side current-user helper;
- structured `AUTH_REQUIRED`, `FORBIDDEN`, and duplicate email errors;
- protected listing create/update/archive APIs;
- Swagger/OpenAPI updates for auth-related responses and registration;
- tests for password validation, registration, auth errors, and owner checks.

This slice does not cover:

- OAuth providers such as GitHub, Google, or Facebook;
- password reset;
- email verification;
- UI login/register pages beyond API support;
- production mail delivery.

## Architecture

Auth.js owns session creation and session reading. Credentials login validates the submitted email/password against our Prisma `User.passwordHash`. Registration is a normal API endpoint because Auth.js credentials provider signs in existing users but does not create accounts.

```text
register API -> validate body -> hash password -> create user -> user response
login form/Auth.js -> credentials provider -> compare password -> JWT session
listing write API -> requireCurrentUser -> mutation with ownerId / owner check
```

Use JWT sessions for the first slice. This keeps the Prisma schema small and avoids adding adapter tables before OAuth providers are introduced.

## Data Model

Extend `User` with:

- `passwordHash String?`

Existing fields remain:

- `id`
- `email`
- `name`
- `image`
- `listings`
- timestamps

`passwordHash` is nullable so future OAuth-only users can exist without a password.

## API Contracts

Registration endpoint:

- `POST /api/auth/register`
- body: `{ "email": "...", "name": "...", "password": "..." }`
- response: `{ "data": { "user": { "id": "...", "email": "...", "name": "..." } } }`

Structured auth errors:

- `AUTH_REQUIRED`: `401`
- `FORBIDDEN`: `403`
- `EMAIL_ALREADY_EXISTS`: `409`
- `INVALID_CREDENTIALS`: login failure inside the credentials provider

Listing write behavior:

- `POST /api/listings` requires a signed-in user and sets `ownerId`.
- `PATCH /api/listings/{id}` requires the signed-in user to own the listing.
- `DELETE /api/listings/{id}` requires the signed-in user to own the listing and soft-archives it.

## Testing

Use Vitest unit and route tests. Mock Auth.js session access for route tests so they do not need browser cookies. Continue running:

- `npm test`
- `npm run lint`
- `npm run build`
