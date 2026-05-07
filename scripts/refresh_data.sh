#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIPELINE_DIR="$ROOT_DIR/scripts/openbb_pipeline"

cd "$PIPELINE_DIR"

if [ -d ".venv" ]; then
  # shellcheck disable=SC1091
  source ".venv/bin/activate"
else
  echo "No .venv found in scripts/openbb_pipeline."
  echo "Create one with: cd scripts/openbb_pipeline && python3 -m venv .venv"
fi

pip install -r requirements.txt
python run_all.py

echo ""
echo "Local generated JSON refreshed."
echo "Next: refresh your browser if using npm run dev."
echo "If you are serving a production build, run: npm run build"
