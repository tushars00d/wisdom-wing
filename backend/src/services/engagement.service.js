import { Reply } from "../models/Reply.js";
import { Vote } from "../models/Vote.js";

export async function applyVote({ targetType, targetId, userId, value, model }) {
  const existingVote = await Vote.findOne({ targetType, targetId, userId });
  let delta = 0;

  if (value === 0) {
    if (existingVote) {
      delta = -existingVote.value;
      await existingVote.deleteOne();
    }
  } else if (existingVote) {
    delta = value - existingVote.value;
    existingVote.value = value;
    await existingVote.save();
  } else {
    delta = value;
    await Vote.create({ targetType, targetId, userId, value });
  }

  if (delta !== 0) {
    await model.findByIdAndUpdate(targetId, { $inc: { score: delta } });
  }

  return { delta };
}

export async function createReply({
  targetType,
  targetId,
  userId = null,
  content,
  model,
  sourceType = "user",
  sourceUrl
}) {
  const reply = await Reply.create({
    targetType,
    targetId,
    authorId: userId,
    content,
    source_type: sourceType,
    source_url: sourceUrl
  });
  await model.findByIdAndUpdate(targetId, { $inc: { repliesCount: 1 } });
  return reply.populate("authorId", "username fullName status");
}

export async function getReplies(targetType, targetId) {
  return Reply.find({ targetType, targetId })
    .populate("authorId", "username fullName status")
    .sort({ createdAt: 1 })
    .lean();
}

export async function getUserVote(targetType, targetId, userId) {
  const vote = await Vote.findOne({ targetType, targetId, userId }).lean();
  return vote?.value ?? 0;
}
