export function buildDuplicateSearchPayload(title) {
  return {
    mode: "vector-search",
    index: "question_embedding_index",
    path: "embedding",
    sourceText: title,
    numCandidates: 100,
    limit: 3
  };
}

export function buildAiSummaryPrompt({ title, contextChunks }) {
  return [
    "You are the Wisdom Wing AI Assistant.",
    "Provide supportive, careful guidance to a college student.",
    "Base the answer only on the supplied campus knowledge context.",
    `Question: ${title}`,
    `Context: ${contextChunks.join(" | ")}`,
    "Rules: stay under 150 words, avoid overstating certainty, and mention when a senior reply would still help."
  ].join("\n");
}
