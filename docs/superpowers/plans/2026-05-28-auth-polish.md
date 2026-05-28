# Auth Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the existing local credentials auth flow with signed-in redirects, safer failure handling, and submitting-state form controls.

**Architecture:** Keep Auth.js credentials and existing callback URL validation. Add server-side redirects to auth pages, and extract small client submission helpers so login/register failure behavior can be tested without a DOM harness.

**Tech Stack:** Next.js App Router, Auth.js, React, TypeScript, Vitest.

---

## File Structure

- Modify `apps/web/src/app/login/page.tsx`: read session with `auth()` and redirect signed-in users to the sanitized callback URL.
- Create `apps/web/src/app/login/page.test.tsx`: verify signed-in redirect and signed-out render path.
- Modify `apps/web/src/app/register/page.tsx`: read session with `auth()` and redirect signed-in users to the sanitized callback URL.
- Create `apps/web/src/app/register/page.test.tsx`: verify signed-in redirect and signed-out render path.
- Modify `apps/web/src/features/auth/components/login-form.tsx`: export a login submission helper, catch sign-in exceptions, and disable fields while submitting.
- Create `apps/web/src/features/auth/components/login-form.test.tsx`: verify helper result mapping.
- Modify `apps/web/src/features/auth/components/register-form.tsx`: export a registration submission helper, catch fetch/sign-in exceptions, and disable fields while submitting.
- Create `apps/web/src/features/auth/components/register-form.test.tsx`: verify helper result mapping.

## Tasks

### Task 1: Signed-in Auth Page Redirects

**Files:**
- Modify: `apps/web/src/app/login/page.tsx`
- Modify: `apps/web/src/app/register/page.tsx`
- Test: `apps/web/src/app/login/page.test.tsx`
- Test: `apps/web/src/app/register/page.test.tsx`

- [ ] Write failing page tests for signed-in redirects and signed-out render behavior.
- [ ] Run `npm test -- login/page.test.tsx register/page.test.tsx` and confirm redirect tests fail.
- [ ] Import `auth()` and `redirect()` in both pages.
- [ ] Resolve the callback URL first, then redirect signed-in users to that safe callback URL.
- [ ] Run `npm test -- login/page.test.tsx register/page.test.tsx` and confirm it passes.

### Task 2: Login Form Failure Polish

**Files:**
- Modify: `apps/web/src/features/auth/components/login-form.tsx`
- Test: `apps/web/src/features/auth/components/login-form.test.tsx`

- [ ] Write failing tests for a `submitLogin` helper that returns success, invalid-credentials error, and unexpected retry error results.
- [ ] Run `npm test -- login-form.test.tsx` and confirm the helper tests fail.
- [ ] Export `submitLogin({ email, password, callbackUrl, signInFn })`.
- [ ] Update `LoginForm` to use the helper, catch failures, and disable inputs while submitting.
- [ ] Run `npm test -- login-form.test.tsx` and confirm it passes.

### Task 3: Register Form Failure Polish

**Files:**
- Modify: `apps/web/src/features/auth/components/register-form.tsx`
- Test: `apps/web/src/features/auth/components/register-form.test.tsx`

- [ ] Write failing tests for a `submitRegistration` helper that returns success, API message errors, sign-in-after-registration errors, and network retry errors.
- [ ] Run `npm test -- register-form.test.tsx` and confirm the helper tests fail.
- [ ] Export `submitRegistration({ name, email, password, callbackUrl, fetcher, signInFn })`.
- [ ] Update `RegisterForm` to use the helper, catch failures, and disable inputs while submitting.
- [ ] Run `npm test -- register-form.test.tsx` and confirm it passes.

### Task 4: Full Verification

**Files:**
- Verify current branch only.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Commit with `git commit -m "Polish credentials auth flow"`.

