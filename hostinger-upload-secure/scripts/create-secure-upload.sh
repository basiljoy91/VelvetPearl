#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGING_DIR="$ROOT_DIR/.deploy-secure"
OUTPUT_ZIP="$ROOT_DIR/hostinger-upload-secure.zip"

rm -rf "$STAGING_DIR"
rm -f "$OUTPUT_ZIP"

mkdir -p "$STAGING_DIR"

copy_if_present() {
  local path="$1"
  if [[ -e "$ROOT_DIR/$path" ]]; then
    cp -R "$ROOT_DIR/$path" "$STAGING_DIR/$path"
  fi
}

copy_if_present "backend"
copy_if_present "public"
copy_if_present "scripts"
copy_if_present "src"
copy_if_present "dist"
copy_if_present "package.json"
copy_if_present "package-lock.json"
copy_if_present "vite.config.js"
copy_if_present "postcss.config.js"
copy_if_present "tailwind.config.js"
copy_if_present "index.html"

# Remove local-only files, secrets, caches, and operational helpers that are not needed in production.
find "$STAGING_DIR" -type d \( -name "node_modules" -o -name ".git" -o -name ".codex" -o -name ".agents" \) -prune -exec rm -rf {} +
find "$STAGING_DIR" -type f \( -name ".env" -o -name ".env.*" -o -name ".DS_Store" -o -name "*.log" \) -delete

rm -f \
  "$STAGING_DIR/backend/test-forgot.js" \
  "$STAGING_DIR/backend/test-db.js" \
  "$STAGING_DIR/backend/test-login.js" \
  "$STAGING_DIR/backend/check-admins.js" \
  "$STAGING_DIR/backend/migrate_bookings.js" \
  "$STAGING_DIR/backend/migrate_drivers.js" \
  "$STAGING_DIR/backend/README.md" \
  "$STAGING_DIR/backend/.env.example" \
  "$STAGING_DIR/.env.production.example"

(
  cd "$STAGING_DIR"
  zip -rq "$OUTPUT_ZIP" .
)

if unzip -Z1 "$OUTPUT_ZIP" | grep -Eq '(^|/)(\.env($|\.)|\.DS_Store$|node_modules/|test-|check-admins\.js$|migrate_)'; then
  echo "Secure archive verification failed: excluded files were found in the ZIP." >&2
  exit 1
fi

echo "Created secure upload package:"
echo "$OUTPUT_ZIP"
ls -lh "$OUTPUT_ZIP"
