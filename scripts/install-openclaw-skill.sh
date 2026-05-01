#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$HOME/clawd/skills/xreader-fetch"
mkdir -p "$TARGET_DIR"
cp "$REPO_DIR/skills/openclaw/xreader-fetch/SKILL.md" "$TARGET_DIR/SKILL.md"
echo "Installed OpenClaw skill to: $TARGET_DIR/SKILL.md"
