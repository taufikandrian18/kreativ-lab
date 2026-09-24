#!/usr/bin/env bash
# Install or update the Kreative Studio Lab plugin on the VPS's WordPress.
#
#   ./scripts/deploy-cms-plugin.sh
#
# Uses the same scripts/deploy.env as deploy-vps.sh. Run it after changing anything in
# wordpress/plugins/kreative-studio-lab, then make sure the plugin is active in
# WordPress (Plugins screen). Development files (tests, vendor, composer) stay behind.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/scripts/deploy.env"
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE"

: "${DEPLOY_HOST:?run scripts/deploy-vps.sh once first, or set DEPLOY_HOST in scripts/deploy.env}"
DEPLOY_USER="${DEPLOY_USER:-root}"
CMS_PATH="${CMS_PATH:-/var/www/kreative-lab-cms}"
PLUGIN_DIR="$CMS_PATH/wp-content/plugins/kreative-studio-lab"
REMOTE="$DEPLOY_USER@$DEPLOY_HOST"

echo "==> Uploading plugin to $REMOTE:$PLUGIN_DIR"
ssh "$REMOTE" "test -d '$CMS_PATH/wp-content/plugins'" \
  || { echo "No WordPress at $CMS_PATH on $REMOTE — start deploy/wordpress first."; exit 1; }
rsync -az --delete \
  --exclude tests --exclude vendor --exclude 'composer.*' --exclude phpunit.xml \
  "$ROOT/wordpress/plugins/kreative-studio-lab/" "$REMOTE:$PLUGIN_DIR/"
# The official WordPress image runs PHP as www-data (uid 33).
ssh "$REMOTE" "chown -R 33:33 '$PLUGIN_DIR'"
echo "==> Done. Activate 'Kreative Studio Lab Content' under Plugins if it is not active."
