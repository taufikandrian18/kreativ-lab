#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8888}"
OUT="wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json"

mkdir -p "$(dirname "$OUT")"

# -L: WordPress's REST API 301-redirects a bare "?query" collection URL to a trailing-slash
# form ("/route/?query") via redirect_canonical. Without -L, curl returns an empty 301 body
# and the json_decode below fails hard. Never caught until this script was actually run
# against a live instance for the first time.
projects=$(curl -sfL "${BASE_URL}/wp-json/wp/v2/archive-projects?per_page=100&_fields=id,ksl_project")
logos=$(curl -sfL "${BASE_URL}/wp-json/wp/v2/client-logos?per_page=100&_fields=id,ksl_logo")
# site-settings replaced the ACF options page (no ACF Pro license — see spec §3 amendment).
# It's a real CPT with a normal collection endpoint, so it's fetched the same way; the
# original plan never fetched the options page at all (it had no collection endpoint to
# fetch from), so this is new coverage, not a change to prior behavior.
settings=$(curl -sfL "${BASE_URL}/wp-json/wp/v2/site-settings?per_page=100&_fields=id,ksl_site_setting")

python3 -c "
import json, sys
projects = json.loads(sys.argv[1])
logos = json.loads(sys.argv[2])
settings = json.loads(sys.argv[3])
out = {
    'archive_projects': [p['ksl_project'] for p in projects],
    'client_logos': [l['ksl_logo'] for l in logos],
    'site_settings': [s['ksl_site_setting'] for s in settings],
}
print(json.dumps(out, indent=2, ensure_ascii=False))
" "$projects" "$logos" "$settings" > "$OUT"

echo "Wrote $OUT"
