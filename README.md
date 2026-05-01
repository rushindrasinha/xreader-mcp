# xreader-mcp

Unofficial MCP + CLI bridge for `xreader.ai`.

What it does:
- accepts `x.com/.../status/...`
- accepts `twitter.com/.../status/...`
- accepts `x.com/.../article/...`
- accepts `xreader.ai/article/<uuid>`
- returns the clean xReader markdown body for direct LLM consumption

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

This is an unofficial wrapper around xReader's public web backend. If xReader changes their Supabase function or schema, this bridge will need an update.
