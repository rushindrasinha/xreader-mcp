#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { articleToMarkdown, articleToSummary, readXReader } from "./xreader-client.mjs";

const InputSchema = z.object({
  input: z.string().min(1).describe("x.com/twitter.com status/article URL, xreader.ai/article URL, or raw xReader article UUID"),
  format: z.enum(["markdown", "json"]).optional().default("markdown"),
});

const server = new Server(
  {
    name: "xreader-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "xreader_read",
      description:
        "Fetch the clean xReader.ai version of an X/Twitter thread/article or an existing xReader article page and return full readable content.",
      inputSchema: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description:
              "x.com/twitter.com status/article URL, xreader.ai/article URL, or raw xReader article UUID",
          },
          format: {
            type: "string",
            enum: ["markdown", "json"],
            description: "Response format. markdown is best for direct model context.",
          },
        },
        required: ["input"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "xreader_read") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = InputSchema.parse(request.params.arguments ?? {});
  const article = await readXReader(args.input);

  const text =
    args.format === "json"
      ? JSON.stringify({ summary: articleToSummary(article), article }, null, 2)
      : articleToMarkdown(article);

  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
