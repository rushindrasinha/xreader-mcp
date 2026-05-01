---
name: xreader-fetch
description: Fetch clean markdown from xReader.ai's official API for X/Twitter thread or X article links, or fetch an existing xReader article page by URL/ID. Use when a user shares an x.com/twitter.com thread/article and wants the AI-readable version in full context. Also use when given an xreader.ai/article/... link.
---

# xReader Fetch

Use xReader when the input is:
- `https://x.com/.../status/...`
- `https://twitter.com/.../status/...`
- `https://x.com/.../article/...`
- `https://xreader.ai/article/<uuid>`

## Preferred path

Use the shared Node wrapper from this repo:

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

## Workflow

1. If the user provides an xReader article URL, fetch the stored article directly by ID.
2. If the user provides an X/Twitter URL, call xReader's extractor and return the cleaned article.
3. Use the returned markdown as the primary reading context for summaries, analysis, repurposing, or Q&A.

## Constraints

- This wrapper uses xReader's first-party API endpoints via the local `xreader-mcp` bridge.
- Current xReader support is limited to X/Twitter status/article URLs and existing `xreader.ai/article/...` pages.
- For arbitrary non-X web articles, use normal web/article extraction tools instead of this skill.
