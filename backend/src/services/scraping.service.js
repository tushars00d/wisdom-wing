function tokenize(text) {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

function scoreCandidate(query, text) {
  const queryTokens = new Set(tokenize(query));
  const bodyTokens = tokenize(text);

  if (!queryTokens.size || !bodyTokens.length) {
    return 0;
  }

  const matches = bodyTokens.filter((token) => queryTokens.has(token)).length;
  return matches / Math.max(queryTokens.size, 1);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "WisdomWingBot/1.0",
        ...(options.headers ?? {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

function summarizeCandidate(candidate) {
  return candidate.text
    .split(/[.?!]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(". ");
}

export async function scrapeJiitWebsite(query) {
  const url = `https://www.jiit.ac.in/search/node?keys=${encodeURIComponent(query)}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn("JIIT scrape failed:", response.status);
      return [];
    }

    const html = await response.text();
    const snippets = Array.from(
      html.matchAll(/<div[^>]*class="[^"]*search-result[^"]*"[\s\S]*?<\/div>/gi),
      (match) => stripHtml(match[0])
    );

    return snippets
      .map((text, index) => ({
        source: "jiit",
        sourceUrl: url,
        title: `JIIT result ${index + 1}`,
        text,
        score: scoreCandidate(query, text)
      }))
      .filter((candidate) => candidate.text.length > 80);
  } catch (error) {
    console.warn("JIIT scraper error:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function scrapeReddit(query) {
  const url = `https://www.reddit.com/r/JIIT__NOIDA/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=8&sort=relevance`;

  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      console.warn("Reddit scrape failed:", response.status);
      return [];
    }

    const payload = await response.json();
    const posts = payload?.data?.children ?? [];

    return posts
      .map((entry) => entry?.data)
      .filter(Boolean)
      .map((post) => ({
        source: "reddit",
        sourceUrl: `https://www.reddit.com${post.permalink ?? ""}`,
        title: post.title,
        text: [post.title, post.selftext].filter(Boolean).join(". "),
        score: scoreCandidate(query, [post.title, post.selftext].filter(Boolean).join(" "))
      }))
      .filter((candidate) => candidate.text.length > 40);
  } catch (error) {
    console.warn("Reddit scraper error:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function findBestScrapedAnswer({ questionText, communityName, collegeName }) {
  const query = [communityName, collegeName, questionText, "JIIT Noida"]
    .filter(Boolean)
    .join(" ");
  const candidates = [...(await scrapeJiitWebsite(query)), ...(await scrapeReddit(query))]
    .sort((a, b) => b.score - a.score);

  const best = candidates.find((candidate) => candidate.score >= 0.25 && candidate.text.trim().length > 80);

  if (!best) {
    return null;
  }

  return {
    body: `Scraped guidance from ${best.source.toUpperCase()}: ${summarizeCandidate(best)}.`,
    sourceUrl: best.sourceUrl
  };
}
