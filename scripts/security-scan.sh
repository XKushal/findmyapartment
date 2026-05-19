#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Scanning tracked and untracked project files for common secret patterns..."

set +e
rg \
  --hidden \
  --glob '!.git/**' \
  --glob '!**/node_modules/**' \
  --glob '!**/.next/**' \
  --glob '!**/dist/**' \
  --glob '!**/build/**' \
  --glob '!**/package-lock.json' \
  --glob '!**/pnpm-lock.yaml' \
  --glob '!**/yarn.lock' \
  --glob '!scripts/security-scan.sh' \
  --regexp 'mongodb(\+srv)?:\/\/[A-Za-z0-9._%+-]+:[^<>"[:space:]]{8,}@' \
  --regexp '-----BEGIN (RSA |OPENSSH |DSA |EC |PGP )?PRIVATE KEY-----' \
  --regexp '(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AUTH_SECRET|NEXTAUTH_SECRET|MONGODB_URI|VERCEL_TOKEN)=["'\'']?[A-Za-z0-9_./+=-]{20,}' \
  .
scan_status=$?
set -e

if [ "$scan_status" -eq 0 ]; then
  echo "Potential secret found. Review the matches above before committing."
  exit 1
fi

if [ "$scan_status" -gt 1 ]; then
  echo "Secret scan failed before completing. Review the scanner error above."
  exit "$scan_status"
fi

echo "No common secret patterns found."
