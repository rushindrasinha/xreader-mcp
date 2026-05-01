---
name: xreader-fetch
description: Read X/Twitter threads or X article links through xReader.ai's official API so Claude gets the full clean AI-readable version instead of the raw tweet page. Also accepts xreader.ai/article URLs.
---

# xReader Fetch

Use this when the user provides:
- `https://x.com/.../status/...`
- `https://twitter.com/.../status/...`
- `https://x.com/.../article/...`
- `https://xreader.ai/article/<uuid>`

## Preferred path

Use the local CLI wrapper from this repo:

```bash
node /absolute/path/to/xreader-mcp/src/cli.mjs "<url>"
```

For structured output:

```bash
node /absolute/path/to/xreader-mcp/src/cli.mjs "<url>" --format json
```

## If MCP is configured

Call the MCP tool:
- `xreader_read(input="<url>", format="markdown")`

## Notes

- This uses the local official `xreader-mcp` bridge over xReader's first-party API.
- Best for direct model context, summarization, thread analysis, and content repurposing.
- For arbitrary non-X web articles, use a normal web/article extraction path instead.
