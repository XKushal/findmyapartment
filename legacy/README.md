# Legacy Versions

This directory contains the historical Express/EJS prototype versions of
StCloudAptss. They are kept for reference only.

Active development now lives in `apps/web`.

## Version Notes

| Version | Role |
| --- | --- |
| `v1` | First in-memory apartment listing prototype. |
| `v2` | First MongoDB-backed apartment CRUD version. |
| `v3` / `v4` | Model and seed refactors with apartment comments. |
| `v5` | Better route and view organization. |
| `v6` | Passport-based registration, login, logout, and protected comments. |
| `v7` | Express route refactor. |
| `v8` | Comment ownership. |
| `v9` | Apartment ownership. |
| `v10` | Owner-only edit and delete for apartments and comments. |
| `v11` | Review and rating experiment. |
| `v12` | Final stable old baseline with auth, ownership, flash messages, and apartment/comment CRUD. |

These folders should not receive new feature work. If old behavior needs to be
checked, compare it against the modern implementation in `apps/web` and port only
the product behavior that still matters.
