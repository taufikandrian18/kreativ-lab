#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:8888}"
OUT="wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json"

mkdir -p "$(dirname "$OUT")"

projects=$(curl -sf "${BASE_URL}/wp-json/wp/v2/archive-projects?per_page=100&_fields=id,ksl_project")
logos=$(curl -sf "${BASE_URL}/wp-json/wp/v2/client-logos?per_page=100&_fields=id,ksl_logo")

python3 -c "
import json, sys
projects = json.loads(sys.argv[1])
logos = json.loads(sys.argv[2])
out = {
    'archive_projects': [p['ksl_project'] for p in projects],
    'client_logos': [l['ksl_logo'] for l in logos],
}
print(json.dumps(out, indent=2, ensure_ascii=False))
" "$projects" "$logos" > "$OUT"

echo "Wrote $OUT"
