# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-05-01

### Added
- Public repo packaging for `xreader-mcp`
- Embedded installation-ready skill files for:
  - Claude Code
  - OpenClaw
- Install helper scripts:
  - `scripts/install-claude-skill.sh`
  - `scripts/install-openclaw-skill.sh`
- Screenshot assets for the README under `docs/screenshots/`
- Config examples for Claude Desktop and OpenClaw MCP wiring
- MCP verification using the official MCP SDK client

### Changed
- Switched the bridge from direct public backend access to xReader's first-party API endpoints:
  - `api-extract`
  - `api-article/:id`
- Added support for `XREADER_BASE_URL` and `XREADER_API_KEY`
- Repositioned the repo as the official xReader CLI + MCP + skill distribution repo
- Expanded documentation for install, usage, and skill setup

## [0.1.0] - 2026-05-01

### Added
- Initial CLI wrapper for xReader article extraction
- Initial MCP server with `xreader_read`
- X/Twitter URL and xReader article URL support
- Basic unit tests for input classification and markdown formatting
