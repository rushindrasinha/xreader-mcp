const SUPABASE_URL = "https://bjcgmkpgrloafihbhvsz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqY2dta3BncmxvYWZpaGJodnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDMyMDksImV4cCI6MjA4Njg3OTIwOX0.RwPUxD3_fx3BpjQ8Cy4IaJRInnRol_KiPHlFLTTo72U";

const X_URL_RE = /^https?:\/\/(?:www\.|m\.|mobile\.)?(?:x|twitter)\.com\/\w+\/(?:status|article)\/\d+/i;
const XREADER_ARTICLE_RE = /^https?:\/\/xreader\.ai\/article\/([0-9a-f-]{36})(?:[/?#].*)?$/i;
const UUID_RE = /^[0-9a-f-]{36}$/i;

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
};

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
  const url = new URL(`${SUPABASE_URL}/rest/v1/articles`);
  url.searchParams.set("id", `eq.${articleId}`);
  url.searchParams.set("select", "*");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`xReader article lookup failed (${response.status})`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`xReader article not found: ${articleId}`);
  }
  return rows[0];
}

export async function extractArticleFromXUrl(url) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-article`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ url: trimUrl(url) }),
  });

  if (!response.ok) {
    throw new Error(`xReader extraction failed (${response.status})`);
  }

  const payload = await response.json();
  if (!payload?.success || !payload?.article) {
    throw new Error(payload?.error || "xReader extraction failed");
  }
  return payload.article;
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
