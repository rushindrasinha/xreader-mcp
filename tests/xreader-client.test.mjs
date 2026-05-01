import test from "node:test";
import assert from "node:assert/strict";
import { articleToMarkdown, classifyInput } from "../src/xreader-client.mjs";

test("classifyInput detects xreader article URLs", () => {
  assert.deepEqual(classifyInput("https://xreader.ai/article/7d1f0756-2304-465a-ab3e-737c00b4171e"), {
    kind: "article_id",
    value: "7d1f0756-2304-465a-ab3e-737c00b4171e",
  });
});

test("classifyInput detects x status URLs", () => {
  assert.deepEqual(classifyInput("https://x.com/iRushi/status/2026728386857447851?foo=bar"), {
    kind: "x_url",
    value: "https://x.com/iRushi/status/2026728386857447851",
  });
});

test("articleToMarkdown includes metadata header", () => {
  const markdown = articleToMarkdown({
    article_title: "Test Title",
    author_name: "Rushi",
    author_handle: "irushi",
    original_url: "https://x.com/irushi/status/1",
    content_type: "thread",
    id: "abc",
    article_body_markdown: "Hello world",
  });

  assert.match(markdown, /# Test Title/);
  assert.match(markdown, /author: Rushi \(@irushi\)/);
  assert.match(markdown, /Hello world/);
});
