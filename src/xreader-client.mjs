const DEFAULT_FUNCTIONS_BASE_URL = "https://bjcgmkpgrloafihbhvsz.supabase.co/functions/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

const X_URL_RE =
  /^https?:\/\/(?:www\.|m\.|mobile\.)?(?:x|twitter)\.com\/(?:i\/web\/|i\/)?(?:\w+\/)?(?:status|article)\/\d+/i;
const XREADER_ARTICLE_RE = /^https?:\/\/xreader\.ai\/article\/([0-9a-f-]{36})(?:[/?#].*)?$/i;
const UUID_RE = /^[0-9a-f-]{36}$/i;
const X_HOSTLIKE_PREFIX_RE = /^(?:www\.|m\.|mobile\.)?(?:x|twitter)\.com\//i;
const X_STATUS_PATH_RE =
  /(https?:\/\/(?:www\.|m\.|mobile\.)?(?:x|twitter)\.com\/(?:i\/web\/|i\/)?(?:\w+\/)?(?:status|article)\/\d+)/i;

function getConfig() {
  const rawTimeout = Number(process.env.XREADER_TIMEOUT_MS);
  return {
    baseUrl: (process.env.XREADER_BASE_URL || DEFAULT_FUNCTIONS_BASE_URL).replace(/\/$/, ""),
    apiKey: process.env.XREADER_API_KEY || "",
    timeoutMs: Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : DEFAULT_TIMEOUT_MS,
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

function ensureScheme(value) {
  if (X_HOSTLIKE_PREFIX_RE.test(value)) return `https://${value}`;
  return value;
}

export function normalizeXUrl(url) {
  const raw = ensureScheme(String(url).trim());
  const match = raw.match(X_STATUS_PATH_RE);
  if (!match) return raw.split("?")[0].split("#")[0];
  return match[1];
}

async function fetchWithTimeout(url, options = {}) {
  const { timeoutMs } = getConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`xReader request timed out after ${timeoutMs}ms`);
    }
    throw new Error(`xReader request failed: ${error?.message || String(error)}`);
  } finally {
    clearTimeout(timer);
  }
}

async function readErrorBody(response) {
  const text = await response.text().catch(() => "");
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    return parsed?.error || parsed?.message || text.slice(0, 300);
  } catch {
    return text.slice(0, 300);
  }
}

export function classifyInput(input) {
  const value = ensureScheme(String(input || "").trim());
  if (!value) throw new Error("Missing URL or article ID");
  if (UUID_RE.test(value)) return { kind: "article_id", value };
  const xreader = value.match(XREADER_ARTICLE_RE);
  if (xreader) return { kind: "article_id", value: xreader[1] };
  if (X_URL_RE.test(value)) return { kind: "x_url", value: normalizeXUrl(value) };
  throw new Error(
    "Unsupported input. Use an x.com/twitter.com status/article URL, xreader.ai/article/<id>, or a raw xReader article UUID.",
  );
}

export async function fetchArticleById(articleId) {
  const { baseUrl } = getConfig();
  const url = new URL(`${baseUrl}/api-article/${articleId}`);
  url.searchParams.set("format", "json");

  const response = await fetchWithTimeout(url, { headers: buildHeaders() });
  if (!response.ok) {
    const detail = await readErrorBody(response);
    throw new Error(
      `xReader article lookup failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const payload = await response.json();
  if (!payload?.article) {
    throw new Error(payload?.error || `xReader article not found: ${articleId}`);
  }
  return normalizeApiArticleResponse(payload, articleId);
}

export async function extractArticleFromXUrl(url) {
  const { baseUrl } = getConfig();
  const response = await fetchWithTimeout(`${baseUrl}/api-extract`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ url: normalizeXUrl(url), format: "json" }),
  });

  if (!response.ok) {
    const detail = await readErrorBody(response);
    throw new Error(
      `xReader extraction failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
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
