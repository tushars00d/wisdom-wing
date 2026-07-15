const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

const VECTOR_DIMENSIONS = 256;

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function createLocalEmbedding(text) {
  const vector = Array.from({ length: VECTOR_DIMENSIONS }, () => 0);
  const normalized = normalizeText(text);

  if (!normalized) {
    return vector;
  }

  for (const token of normalized.split(/\s+/)) {
    let hash = 0;

    for (const character of token) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    const index = hash % VECTOR_DIMENSIONS;
    vector[index] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(8)));
}

async function createGeminiEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: `models/${process.env.EMBEDDING_MODEL ?? "text-embedding-004"}`,
      content: {
        parts: [{ text }]
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini embedding request failed: ${errorBody}`);
  }

  const payload = await response.json();
  return payload.embedding.values;
}

export async function createEmbedding(text) {
  const provider = (process.env.EMBEDDING_PROVIDER ?? "local").toLowerCase();

  if (provider === "gemini") {
    try {
      return await createGeminiEmbedding(text);
    } catch (error) {
      console.warn("Falling back to local embeddings:", error);
    }
  }

  return createLocalEmbedding(text);
}

export function buildSearchableQuestionText(question) {
  return [question.title, question.body, ...(question.tags ?? [])].filter(Boolean).join("\n");
}

export function getVectorDimensions() {
  return VECTOR_DIMENSIONS;
}
