# Code Review and Secrets Standard

Date: 2026-05-18

## Policy

No secrets should be committed to GitHub. This includes:

- MongoDB connection strings;
- database usernames and passwords;
- Auth.js secrets;
- OAuth client IDs and client secrets;
- Vercel tokens;
- private keys;
- API keys;
- session secrets.

Real secrets belong only in local `.env.local` files and deployment platform environment variables. Commit `.env.example` files with placeholder values only.

## Immediate Security Action

The MongoDB Atlas URI was shared in chat during setup. Treat that database password as exposed.

Required action:

1. Go to MongoDB Atlas.
2. Open the `AllApartments` project.
3. Go to Database Access.
4. Rotate the password for the application database user, or create a new app-specific user.
5. Delete the old password after updating local and Vercel environment variables.
6. Never commit the full URI to the repo.

## MongoDB Atlas Standards

- Use a dedicated app database user, not a personal Atlas login.
- Grant the database user the minimum permissions needed for the app.
- Use a strong generated password.
- Prefer an IP allowlist with the smallest practical range.
- For local development, allow only the current developer IP when possible.
- For early Vercel testing, broad access may be temporarily necessary, but it must be paired with strong credentials and reviewed before production.
- Store the connection string as `DATABASE_URL`.
- Percent-encode special characters in the username or password before putting them in the URI. For example, `@` becomes `%40`.

## Local Environment Files

The real file should be:

```text
apps/web/.env.local
```

Expected keys:

```bash
DATABASE_URL="mongodb+srv://<db-user>:<db-password>@<cluster-host>/allapartments?retryWrites=true&w=majority&appName=Cluster0"
AUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

Only commit an example file:

```bash
DATABASE_URL="mongodb+srv://<db-user>:<db-password>@<cluster-host>/allapartments?retryWrites=true&w=majority&appName=Cluster0"
AUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
```

## Required Review Before Push

Before pushing any branch:

1. Run `git status --short`.
2. Run `git diff --cached` if files are staged.
3. Run `scripts/security-scan.sh`.
4. Confirm no `.env`, `.env.local`, database URI, private key, or API token is staged.
5. Request code review before merging feature branches.

## Review Agent Workflow

For every implementation branch, use a code-review pass before merge. The reviewer should check:

- no secrets are present in tracked files;
- `.gitignore` protects local environment files;
- database access uses `process.env.DATABASE_URL`;
- auth secrets use environment variables;
- no connection string is hard-coded;
- Prisma schema does not contain real credentials;
- server-only logic does not leak secrets to client components;
- forms validate input before writes;
- authorization checks protect owner-only actions.

Critical or important findings must be fixed before pushing to GitHub or opening a PR.
