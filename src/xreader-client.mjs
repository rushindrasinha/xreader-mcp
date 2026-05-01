const DEFAULT_FUNCTIONS_BASE_URL = "https://bjcgmkpgrloafihbhvsz.supabase.co/functions/v1";

const X_URL_RE = /^https?:\/\/(?:www\.|m\.|mobile\.)?(?:x|twitter)\.com\/\w+\/(?:status|article)\/\d+/i;
const XREADER_ARTICLE_RE = /^https?:\/\/xreader\.ai\/article\/([0-9a-f-]{36})(?:[/?#].*)?$/i;
const UUID_RE = /^[0-9a-f-]{36}$/i;

function getConfig() {
  return {
    baseUrl: (process.env.XREADER_BASE_URL || DEFAULT_FUNCTIONS_BASE_URL).replace(/\/$/, ""),
    apiKey: process.env.XREADER_API_KEY || "",
  };
}

function buildHeaders(extra = {}) {
  const { apiKey } = getConfig();
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { "x-api-key": apiKey } : {}),
    ...extra,
  };
}

function trimUrl(url) {
  return String(url).trim().split("?")[0].split("#")[0];
}

export function classifyInput(input) {
  const value = String(input || "").trim();
  if (!value) throw new Error("Missing URL or article ID");
  if (UUID_RE.test(value)) return { kind: "article_id", value };
  const xreader = value.match(XREADER_ARTICLE_RE);
  if (xreader) return { kind: "article_id", value: xreader[1] };
  if (X_URL_RE.test(value)) return { kind: "x_url", value: trimUrl(value) };
  throw new Error(
    "Unsupported input. Use an x.com/twitter.com status/article URL, xreader.ai/article/<id>, or a raw xReader article UUID.",
  );
}

export async function fetchArticleById(articleId) {
  const { baseUrl } = getConfig();
  const url = new URL(`${baseUrl}/api-article/${articleId}`);
  url.searchParams.set("format", "json");

  const response = await fetch(url, { headers: buildHeaders() });
  if (!response.ok) {
    throw new Error(`xReader article lookup failed (${response.status})`);
  }

  const payload = await response.json();
  if (!payload?.article) {
    throw new Error(payload?.error || `xReader article not found: ${articleId}`);
  }
  return normalizeApiArticleResponse(payload, articleId);
}

export async function extractArticleFromXUrl(url) {
  const { baseUrl } = getConfig();
  const response = await fetch(`${baseUrl}/api-extract`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ url: trimUrl(url), format: "json" }),
  });

  if (!response.ok) {
    throw new Error(`xReader extraction failed (${response.status})`);
  }

  const payload = await response.json();
  if (!payload?.article) {
    throw new Error(payload?.error || "xReader extraction failed");
  }
  return normalizeApiArticleResponse(payload);
}

export async function readXReader(input) {
  const normalized = classifyInput(input);
  return normalized.kind === "article_id"
    ? await fetchArticleById(normalized.value)
    : await extractArticleFromXUrl(normalized.value);
}

export function articleToMarkdown(article) {
  const lines = [
    `# ${article.article_title || "Untitled"}`,
    "",
    `- author: ${article.author_name || ""} (@${article.author_handle || ""})`,
    `- source_url: ${article.original_url || ""}`,
    `- content_type: ${article.content_type || ""}`,
    `- xreader_article_id: ${article.id || ""}`,
    "",
    (article.article_body_markdown || "").trim(),
    "",
  ];
  return lines.join("\n");
}

export function articleToSummary(article) {
  return {
    id: article.id,
    title: article.article_title,
    author_name: article.author_name,
    author_handle: article.author_handle,
    original_url: article.original_url,
    content_type: article.content_type,
    extracted_at: article.extracted_at,
    publication_date: article.publication_date,
    view_count: article.view_count,
  };
}

function normalizeApiArticleResponse(payload, fallbackId = null) {
  const article = payload.article || {};
  const author = article.author || {};
  const meta = payload.meta || {};
  return {
    id: meta.id || fallbackId,
    original_url: article.url,
    author_name: author.name,
    author_handle: author.handle,
    author_avatar_url: author.avatar,
    article_title: article.title,
    article_body_markdown: article.content,
    article_body_html: article.html,
    publication_date: article.published,
    extracted_at: meta.parsed_at,
    view_count: article.view_count,
    content_type: article.content_type || "article",
    xreader_url: meta.xreader_url,
  };
}
