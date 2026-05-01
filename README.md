<p align="center">
  <img src="docs/screenshots/xreader-home.png" alt="xReader homepage" width="100%" />
</p>

<h1 align="center">xreader-mcp</h1>

<p align="center">
  The official xReader.ai bridge for <strong>MCP</strong>, <strong>CLI</strong>, <strong>Claude Code skills</strong>, and <strong>OpenClaw skills</strong>.
</p>

<p align="center">
  Turn any supported X/Twitter thread or X article URL into clean, AI-readable markdown your agents can actually use.
</p>

<p align="center">
  <a href="https://github.com/rushindrasinha/xreader-mcp">GitHub</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#claude-code-setup">Claude Code</a> •
  <a href="#openclaw-setup">OpenClaw</a> •
  <a href="#screenshots">Screenshots</a>
</p>

---

## Why this exists

xReader already turns noisy X/Twitter content into a clean reading experience.

`xreader-mcp` makes that same experience available inside agent workflows:
- **MCP clients** can call xReader as a tool
- **CLI workflows** can fetch clean markdown or structured JSON
- **Claude Code** can install a focused skill for thread/article reading
- **OpenClaw** can install the same behavior as a reusable skill

Instead of giving your model a raw timeline URL, you give it the fully parsed article body.

## What it does

### Supported inputs
- `https://x.com/.../status/...`
- `https://twitter.com/.../status/...`
- `https://x.com/.../article/...`
- `https://xreader.ai/article/<uuid>`

### Supported outputs
- **Markdown** — best for direct model context
- **JSON** — best for programmatic workflows

### Backed by xReader's first-party API
- `api-extract`
- `api-article/:id`

## What you get in this repo

```text
xreader-mcp/
├── src/
│   ├── cli.mjs                     # local CLI wrapper
│   ├── server.mjs                  # stdio MCP server
│   └── xreader-client.mjs          # xReader API client
├── skills/
│   ├── claude/xreader-fetch/SKILL.md
│   └── openclaw/xreader-fetch/SKILL.md
├── scripts/
│   ├── install-claude-skill.sh
│   └── install-openclaw-skill.sh
├── config/
│   ├── claude-desktop.example.json
│   └── openclaw-mcp.example.json
├── docs/
│   ├── screenshots/
│   └── skills.md
├── tests/
├── CHANGELOG.md
└── README.md
```

## Quick start

```bash
git clone https://github.com/rushindrasinha/xreader-mcp.git
cd xreader-mcp
npm install
```

### Optional environment variables

```bash
export XREADER_BASE_URL="https://bjcgmkpgrloafihbhvsz.supabase.co/functions/v1"
export XREADER_API_KEY="<your-xreader-api-key>"
```

| Variable | Required | Purpose |
|---|---:|---|
| `XREADER_BASE_URL` | No | Override the xReader API base URL |
| `XREADER_API_KEY` | No | Attach your first-party xReader API key for rate limits, usage tracking, and paid tiers |

## CLI usage

### Read a thread/article as markdown

```bash
node src/cli.mjs "https://x.com/i/status/2026728386857447851"
```

### Fetch structured JSON

```bash
node src/cli.mjs "https://xreader.ai/article/7d1f0756-2304-465a-ab3e-737c00b4171e" --format json
```

### Example output shape

```json
{
  "summary": {
    "id": "7d1f0756-2304-465a-ab3e-737c00b4171e",
    "title": "$1M with 0 IQ copytrading PolyMarket insiders",
    "author_handle": "DeFi_Hanzo",
    "content_type": "article"
  },
  "article": {
    "article_title": "...",
    "article_body_markdown": "..."
  }
}
```

## MCP usage

Run the stdio MCP server:

```bash
node src/server.mjs
```

### Exposed tool

#### `xreader_read`

**Arguments**
- `input` — X/Twitter URL, xReader article URL, or raw article UUID
- `format` — `markdown` or `json` (default: `markdown`)

**Best use case**
- give your model the full cleaned article body instead of a raw social URL

## Claude Code setup

### 1) Register the MCP server

Use `config/claude-desktop.example.json` as the template:

```json
{
  "mcpServers": {
    "xreader": {
      "command": "node",
      "args": ["/absolute/path/to/xreader-mcp/src/server.mjs"],
      "env": {
        "XREADER_BASE_URL": "https://bjcgmkpgrloafihbhvsz.supabase.co/functions/v1",
        "XREADER_API_KEY": "<your-xreader-api-key>"
      }
    }
  }
}
```

### 2) Install the Claude Code skill

```bash
./scripts/install-claude-skill.sh
```

Installed to:
- `~/.claude/skills/xreader-fetch/SKILL.md`

### What the skill does

When Claude sees an X/Twitter thread or xReader article link, the skill instructs it to:
- call xReader through the local bridge
- fetch the clean markdown body
- use that markdown as the primary reasoning context
- avoid relying on the raw tweet UI when the article body is available

## OpenClaw setup

### 1) Register the MCP server

Use `config/openclaw-mcp.example.json` as the template:

```json
{
  "mcp": {
    "servers": {
      "xreader": {
        "command": "node",
        "args": ["/absolute/path/to/xreader-mcp/src/server.mjs"],
        "env": {
          "XREADER_BASE_URL": "https://bjcgmkpgrloafihbhvsz.supabase.co/functions/v1",
          "XREADER_API_KEY": "<your-xreader-api-key>"
        }
      }
    }
  }
}
```

### 2) Install the OpenClaw skill

```bash
./scripts/install-openclaw-skill.sh
```

Installed to:
- `~/clawd/skills/xreader-fetch/SKILL.md`

### What the skill does

When OpenClaw sees a supported X/Twitter or xReader URL, the skill tells it to:
- fetch the xReader-cleaned body
- prefer markdown for model context
- use the `xreader_read` MCP tool when MCP is configured
- fall back to normal article extraction for non-X URLs

More detail: [`docs/skills.md`](docs/skills.md)

## Screenshots

### Homepage

![xReader homepage](docs/screenshots/xreader-home.png)

### Reading view

![xReader article reading view](docs/screenshots/xreader-article.png)

## Verification

### Run tests

```bash
npm test
```

### CLI smoke test

```bash
node src/cli.mjs "https://x.com/i/status/2026728386857447851" | head
```

### MCP smoke test

Expected successful behavior:
- MCP client connects to `src/server.mjs`
- tool list includes `xreader_read`
- tool call returns markdown beginning with title + metadata header

## Limitations

- xReader support here is intentionally focused on **X/Twitter threads/articles** and existing `xreader.ai/article/...` pages
- this repo is not a generic web article parser
- if your xReader API base URL changes, update `XREADER_BASE_URL`

## Roadmap

- remote hosted MCP endpoint
- published npm package
- multi-language SDKs
- expanded xReader API coverage beyond read/fetch workflows

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Positioning

**xreader-mcp is the official way to bring xReader into agent workflows — not just browser sessions.**
