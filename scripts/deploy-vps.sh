#!/usr/bin/env bash
# Build the site and publish it to the VPS.
#
#   ./scripts/deploy-vps.sh
#
# Run from the studio Mac: it uses your existing SSH key, so no password or key ever
# passes through this script. The first run asks for the server details and saves them
# to scripts/deploy.env (git-ignored); later runs just deploy.
#
# The SSH user needs write access to the parent of DEPLOY_PATH (root does by default;
# for a non-root user: sudo mkdir -p /var/www && sudo chown $USER /var/www once).
#
# Normally a deploy happens by itself in GitHub Actions (.github/workflows/deploy.yml)
# whenever WordPress publishes or master changes. This script is the manual route to the
# same result, e.g. while those secrets are not set up yet.
#
# What it does: pulls the live content from WordPress when KSL_CMS_URL is set, builds the
# static site to frontend/out, then rsyncs it to the server.
# rsync --delete makes the server an exact mirror, so removed pages disappear too. The
# upload lands in a staging directory first and is swapped in with a single rename, so a
# visitor never sees a half-uploaded site.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/scripts/deploy.env"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

ask() { # ask VAR "prompt" "default"
  local var="$1" prompt="$2" def="${3:-}" val
  if [[ -z "${!var:-}" ]]; then
    read -r -p "$prompt${def:+ [$def]}: " val
    printf -v "$var" '%s' "${val:-$def}"
    echo "$var=\"${!var}\"" >> "$ENV_FILE"
  fi
}

ask DEPLOY_HOST "VPS host or IP"
ask DEPLOY_USER "SSH user" "root"
ask DEPLOY_PATH "Web root on the VPS" "/var/www/kreativ-lab"
ask DEPLOY_DOMAIN "Domain (for the final message only)" "$DEPLOY_HOST"

# The site lives under this URL path (e.g. http://HOST/kreative-lab/). Override in
# scripts/deploy.env with DEPLOY_BASE_PATH="" to serve it at the root instead. The
# web server must strip this prefix before looking up files (see deploy/Caddyfile.snippet).
DEPLOY_BASE_PATH="${DEPLOY_BASE_PATH-/kreative-lab}"

# WordPress to build from. Leave it empty only while no CMS exists: a build without it
# ships the committed fixture, which would roll back anything editors have published.
KSL_CMS_URL="${KSL_CMS_URL-}"

REMOTE="$DEPLOY_USER@$DEPLOY_HOST"

echo "==> Checking SSH access to $REMOTE"
ssh -o BatchMode=yes -o ConnectTimeout=10 "$REMOTE" true \
  || { echo "Cannot reach $REMOTE with your SSH key. Fix access, then re-run."; exit 1; }

cd "$ROOT/frontend"
if [[ -n "$KSL_CMS_URL" ]]; then
  # fetch-cms overwrites the committed fixture with live content for this build; put the
  # fixture back afterwards, success or not, so the working tree is never left dirty.
  trap 'git -C "$ROOT" checkout -- frontend/data/rest-contract.json' EXIT
  KSL_CMS_URL="$KSL_CMS_URL" npm run fetch-cms
else
  echo "==> KSL_CMS_URL not set: building from the committed fixture, not WordPress"
fi

echo "==> Building (base path: ${DEPLOY_BASE_PATH:-/})"
KSL_CMS_URL="$KSL_CMS_URL" NEXT_PUBLIC_BASE_PATH="$DEPLOY_BASE_PATH" npm run build

echo "==> Uploading to $REMOTE:$DEPLOY_PATH"
ssh "$REMOTE" "mkdir -p '$DEPLOY_PATH.next' '$DEPLOY_PATH'"
# Copy the live site into staging first so rsync only sends what changed.
ssh "$REMOTE" "cp -a '$DEPLOY_PATH/.' '$DEPLOY_PATH.next/' 2>/dev/null || true"
# Flags kept to the set macOS's bundled rsync/openrsync understands.
rsync -az --delete out/ "$REMOTE:$DEPLOY_PATH.next/"

echo "==> Switching live"
ssh "$REMOTE" "rm -rf '$DEPLOY_PATH.prev' && mv '$DEPLOY_PATH' '$DEPLOY_PATH.prev' && mv '$DEPLOY_PATH.next' '$DEPLOY_PATH'"

echo "==> Live at http://$DEPLOY_DOMAIN$DEPLOY_BASE_PATH/  (previous version kept at $DEPLOY_PATH.prev)"
