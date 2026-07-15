import { Question } from "../models/Question.js";
import { buildSearchableQuestionText, createEmbedding } from "./embeddings.service.js";

async function runKeywordSearch(query) {
  return Question.find(
    {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { body: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } }
      ]
    },
    {
      title: 1,
      body: 1,
      tags: 1
    }
  )
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
}

async function runSemanticSearch(query) {
  const vector = await createEmbedding(query);
  const indexName = process.env.VECTOR_INDEX_NAME ?? "question_embedding_index";

  try {
    const results = await Question.aggregate([
      {
        $vectorSearch: {
          index: indexName,
          path: "embedding",
          queryVector: vector,
          numCandidates: 100,
          limit: 8
        }
      },
      {
        $project: {
          title: 1,
          body: 1,
          tags: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.warn("Vector search unavailable, returning empty semantic result set.", error);
    return [];
  }
}

export async function runQuestionSearch(query, mode = "hybrid") {
  if (!query.trim()) {
    return [];
  }

  if (mode === "keyword") {
    const keywordResults = await runKeywordSearch(query);
    return keywordResults.map((item) => ({ ...item, searchType: "keyword" }));
  }

  if (mode === "semantic") {
    const semanticResults = await runSemanticSearch(query);
    return semanticResults.map((item) => ({ ...item, searchType: "semantic" }));
  }

  const [keywordResults, semanticResults] = await Promise.all([
    runKeywordSearch(query),
    runSemanticSearch(query)
  ]);

  const merged = new Map();

  for (const result of semanticResults) {
    merged.set(String(result._id), { ...result, searchType: "semantic" });
  }

  for (const result of keywordResults) {
    const id = String(result._id);
    const existing = merged.get(id);

    if (existing) {
      merged.set(id, {
        ...existing,
        searchType: "hybrid"
      });
    } else {
      merged.set(id, { ...result, searchType: "keyword" });
    }
  }

  return Array.from(merged.values()).slice(0, 10);
}

export async function findDuplicateQuestions(title) {
  const results = await runSemanticSearch(title);
  return results.slice(0, 3);
}

export async function prepareQuestionDocument(payload, authorId) {
  const document = {
    title: payload.title?.trim(),
    body: payload.body?.trim(),
    authorId,
    tags: Array.isArray(payload.tags)
      ? payload.tags.filter(Boolean)
      : String(payload.tags ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    isAnonymous: Boolean(payload.isAnonymous)
  };

  document.embedding = await createEmbedding(buildSearchableQuestionText(document));
  return document;
}
