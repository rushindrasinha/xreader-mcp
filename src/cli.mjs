#!/usr/bin/env node
import { articleToMarkdown, articleToSummary, readXReader } from "./xreader-client.mjs";

function parseArgs(argv) {
  const args = { format: "markdown", input: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--format") {
      args.format = argv[i + 1] || "markdown";
      i += 1;
    } else if (!args.input) {
      args.input = token;
    }
  }
  if (!args.input) {
    throw new Error("Usage: xreader-read <url-or-article-id> [--format markdown|json]");
  }
  if (!["markdown", "json"].includes(args.format)) {
    throw new Error("--format must be markdown or json");
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const article = await readXReader(args.input);
  if (args.format === "json") {
    process.stdout.write(`${JSON.stringify({ summary: articleToSummary(article), article }, null, 2)}\n`);
    return;
  }
  process.stdout.write(articleToMarkdown(article));
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
