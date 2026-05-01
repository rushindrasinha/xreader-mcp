import test from "node:test";
import assert from "node:assert/strict";
import {
  articleToMarkdown,
  classifyInput,
  normalizeXUrl,
} from "../src/xreader-client.mjs";

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

test("classifyInput strips s= share-tracking query and trims whitespace", () => {
  assert.deepEqual(
    classifyInput("  https://x.com/zephyr_hg/status/2049805838232047907?s=46  "),
    {
      kind: "x_url",
      value: "https://x.com/zephyr_hg/status/2049805838232047907",
    },
  );
});

test("classifyInput accepts i/web/status share form", () => {
  assert.deepEqual(
    classifyInput("https://x.com/i/web/status/2049805838232047907"),
    {
      kind: "x_url",
      value: "https://x.com/i/web/status/2049805838232047907",
    },
  );
});

test("classifyInput auto-prefixes scheme on bare host", () => {
  assert.deepEqual(
    classifyInput("x.com/zephyr_hg/status/2049805838232047907"),
    {
      kind: "x_url",
      value: "https://x.com/zephyr_hg/status/2049805838232047907",
    },
  );
});

test("classifyInput strips photo/video/analytics sub-paths", () => {
  assert.equal(
    classifyInput("https://x.com/zephyr_hg/status/2049805838232047907/photo/1").value,
    "https://x.com/zephyr_hg/status/2049805838232047907",
  );
  assert.equal(
    classifyInput("https://x.com/zephyr_hg/status/2049805838232047907/video/1").value,
    "https://x.com/zephyr_hg/status/2049805838232047907",
  );
  assert.equal(
    classifyInput("https://x.com/zephyr_hg/status/2049805838232047907/analytics").value,
    "https://x.com/zephyr_hg/status/2049805838232047907",
  );
});

test("classifyInput rejects unsupported inputs with a clear message", () => {
  assert.throws(
    () => classifyInput("https://example.com/notatweet"),
    /Unsupported input/,
  );
  assert.throws(() => classifyInput(""), /Missing URL/);
});

test("normalizeXUrl is idempotent on canonical URLs", () => {
  const canonical = "https://x.com/iRushi/status/2026728386857447851";
  assert.equal(normalizeXUrl(canonical), canonical);
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
