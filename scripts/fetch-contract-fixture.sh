#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8888}"
OUT="wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json"

mkdir -p "$(dirname "$OUT")"

# Using WordPress's always-available "?rest_route=" query form rather than the pretty
# "/wp-json/..." path, which depends on rewrite rules being flushed for the site's permalink
# structure. A fresh `wp core install` defaults to plain permalinks with no flush, so pretty
# REST URLs may not resolve at all — confirmed live against a real instance, where the pretty
# form fell through to a normal theme page render instead of JSON. rest_route= works
# regardless of permalink settings, so it's used here instead of requiring a permalink/flush
# step as a Task 9 prerequisite. -L is kept as a harmless safety net even though this form
# shouldn't redirect.
projects=$(curl -sfL "${BASE_URL}/?rest_route=/wp/v2/archive-projects&per_page=100&_fields=id,ksl_project")
logos=$(curl -sfL "${BASE_URL}/?rest_route=/wp/v2/client-logos&per_page=100&_fields=id,ksl_logo")
# site-settings replaced the ACF options page (no ACF Pro license — see spec §3 amendment).
# It's a real CPT with a normal collection endpoint, so it's fetched the same way; the
# original plan never fetched the options page at all (it had no collection endpoint to
# fetch from), so this is new coverage, not a change to prior behavior.
settings=$(curl -sfL "${BASE_URL}/?rest_route=/wp/v2/site-settings&per_page=100&_fields=id,ksl_site_setting")

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
