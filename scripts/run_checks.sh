#!/usr/bin/env bash
# Runner for release checks. Add more scripts here as new checks are created.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$SCRIPT_DIR/check_locales.py"

echo "Running: check_locales"
python3 "$PY" --locales-dir "$SCRIPT_DIR/../ivBlock/ivBlockCore/_locales"

# Add additional checks below, keeping exit codes non-zero on failure.

echo "All checks passed."