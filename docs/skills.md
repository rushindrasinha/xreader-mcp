# Skill installation and behavior

This repo ships first-party skill files for both Claude Code and OpenClaw.

## Included skill files

- `skills/claude/xreader-fetch/SKILL.md`
- `skills/openclaw/xreader-fetch/SKILL.md`

## Claude Code

Install:

```bash
./scripts/install-claude-skill.sh
```

Result:
- `~/.claude/skills/xreader-fetch/SKILL.md`

Expected behavior:
- when Claude receives an X/Twitter thread/article URL or xReader article URL
- it should call the local bridge or MCP tool
- it should pull the clean markdown body
- it should reason over the parsed article, not the raw tweet page

## OpenClaw

Install:

```bash
./scripts/install-openclaw-skill.sh
```

Result:
- `~/clawd/skills/xreader-fetch/SKILL.md`

Expected behavior:
- when OpenClaw receives a supported URL
- it should prefer xReader output for full context
- if MCP is configured, it should use `xreader_read`
- for unsupported non-X article URLs, it should use a normal article extraction path instead

## Recommendation

For the best experience, install both:
1. the skill file
2. the MCP server config

The skill teaches the agent **when** to use xReader.
The MCP server provides the actual callable tool.
