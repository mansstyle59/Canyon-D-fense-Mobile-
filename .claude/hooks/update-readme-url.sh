#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // ""')
echo "$FILE" | grep -q 'vite.config.ts' || exit 0

REPO_DIR="/home/user/Canyon-D-fense-Mobile-"
BASE=$(grep -oP "'\K/[^/']+/" "$REPO_DIR/vite.config.ts" 2>/dev/null | head -1)
[ -z "$BASE" ] && exit 0

OWNER=$(grep -oP 'https://\K[^.]+(?=\.github\.io)' "$REPO_DIR/README.md" 2>/dev/null | head -1)
[ -z "$OWNER" ] && exit 0

NEW_URL="https://${OWNER}.github.io${BASE}"
sed -i "s|https://[a-zA-Z0-9_-]*\.github\.io/[^)\"' ]*|${NEW_URL}|g" "$REPO_DIR/README.md"
