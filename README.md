# xreader-mcp

Official MCP + CLI bridge for `xreader.ai` programmatic endpoints.

What it does:
- accepts `x.com/.../status/...`
- accepts `twitter.com/.../status/...`
- accepts `x.com/.../article/...`
- accepts `xreader.ai/article/<uuid>`
- returns the clean xReader markdown body for direct LLM consumption

This bridge uses xReader's first-party API functions:
- `api-extract`
- `api-article/:id`

## Configuration

Optional environment variables:

```bash
export XREADER_BASE_URL="https://bjcgmkpgrloafihbhvsz.supabase.co/functions/v1"
export XREADER_API_KEY="<your xreader api key>"
```

- `XREADER_BASE_URL` defaults to the current production xReader functions base.
- `XREADER_API_KEY` is optional, but recommended for higher limits and usage tracking.

## Install

```bash
cd xreader-mcp
npm install
```

## CLI

```bash
node src/cli.mjs "https://x.com/i/status/2026728386857447851"
node src/cli.mjs "https://xreader.ai/article/7d1f0756-2304-465a-ab3e-737c00b4171e" --format json
```

## MCP

Run the stdio MCP server:

```bash
node src/server.mjs
```

### Claude Desktop config snippet

```json
{
  "mcpServers": {
    "xreader": {
      "command": "node",
      "args": ["/Users/rushindrasinha/clawd/xreader-mcp/src/server.mjs"]
    }
  }
}
```

### OpenClaw MCP config snippet

OpenClaw can consume stdio MCP servers via its MCP server config. Example shape:

```json
{
  "mcp": {
    "servers": {
      "xreader": {
        "command": "node",
        "args": ["/Users/rushindrasinha/clawd/xreader-mcp/src/server.mjs"]
      }
    }
  }
}
```

## Tool

### `xreader_read`

Input:
- `input` — x/twiter URL, xReader article URL, or raw article UUID
- `format` — `markdown` or `json` (default `markdown`)

Output:
- full cleaned markdown body, or structured JSON

## Caveat

This bridge is now aligned with xReader's first-party API layer, but the default production base URL should be updated if your deployed API origin changes.
