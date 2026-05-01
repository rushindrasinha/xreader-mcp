#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$HOME/.claude/skills/xreader-fetch"
mkdir -p "$TARGET_DIR"
cp "$REPO_DIR/skills/claude/xreader-fetch/SKILL.md" "$TARGET_DIR/SKILL.md"
echo "Installed Claude Code skill to: $TARGET_DIR/SKILL.md"
