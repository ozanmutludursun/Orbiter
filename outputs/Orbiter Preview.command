#!/bin/zsh
set -e
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v npm >/dev/null || ! command -v python3 >/dev/null; then
  echo "Node.js (npm) and Python 3 are required. See outputs/MAC-PREVIEW.md."
  read -r "?Press Return to close."
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm ci
fi
echo "After the server starts, open http://127.0.0.1:8765 in your browser."
npm run preview
