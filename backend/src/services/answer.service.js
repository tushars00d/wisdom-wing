import { Answer } from "../models/Answer.js";
import { Question } from "../models/Question.js";

export function serializeAnswer(answer) {
  return {
    _id: String(answer._id),
    body: answer.body,
    createdAt: answer.createdAt,
    votes: answer.votes ?? 0,
    source_type: answer.source_type ?? "user",
    source_url: answer.source_url,
    authorId: answer.authorId
      ? {
          _id: String(answer.authorId._id ?? answer.authorId),
          username: answer.authorId.username,
          fullName: answer.authorId.fullName,
          status: answer.authorId.status
        }
      : null
  };
}

export async function createAnswer({
  questionId,
  body,
  authorId = null,
  sourceType = "user",
  sourceUrl
}) {
  const answer = await Answer.create({
    questionId,
    authorId,
    body: body.trim(),
    isAiGenerated: sourceType === "AI",
    source_type: sourceType,
    source_url: sourceUrl
  });

  await Question.findByIdAndUpdate(questionId, {
    $inc: { answersCount: 1 }
  });

  return Answer.findById(answer._id)
    .populate("authorId", "username fullName status")
    .lean();
}
