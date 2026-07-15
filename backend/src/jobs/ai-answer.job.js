import { Community } from "../models/Community.js";
import { Question } from "../models/Question.js";
import { createAnswer } from "../services/answer.service.js";
import { generateAIAnswer } from "../services/auto-answer.service.js";
import { findBestScrapedAnswer } from "../services/scraping.service.js";

export function scheduleAiFallbackJob(questionId) {
  return {
    questionId,
    delayMinutes: 0,
    condition: "Trigger immediately if the question still has no answers."
  };
}

export async function runAutoAnswerForQuestion(questionId) {
  const lockedQuestion = await Question.findOneAndUpdate(
    {
      _id: questionId,
      answersCount: 0,
      autoAnswerStatus: { $in: ["idle", "scheduled", "failed"] }
    },
    {
      autoAnswerStatus: "processing"
    },
    {
      new: true
    }
  );

  if (!lockedQuestion) {
    return null;
  }

  try {
    const community = lockedQuestion.communityId
      ? await Community.findById(lockedQuestion.communityId).lean()
      : null;

    let answerPayload = null;

    if (!answerPayload) {
      const aiAnswer = await generateAIAnswer({
        title: lockedQuestion.title,
        body: lockedQuestion.body,
        tags: lockedQuestion.tags,
        communityName: community?.name,
        collegeName: community?.college
      });
      answerPayload = {
        body: aiAnswer,
        sourceType: "AI"
      };
      console.log(`Auto-answer used AI fallback for question ${lockedQuestion._id}`);
    }

    await createAnswer({
      questionId: lockedQuestion._id,
      body: answerPayload.body,
      sourceType: answerPayload.sourceType,
      sourceUrl: answerPayload.sourceUrl
    });

    await Question.findByIdAndUpdate(lockedQuestion._id, {
      autoAnswerStatus: "completed",
      autoAnsweredAt: new Date()
    });

    return answerPayload;
  } catch (error) {
    console.error(`Auto-answer failed for question ${lockedQuestion._id}:`, error);
    await Question.findByIdAndUpdate(lockedQuestion._id, {
      autoAnswerStatus: "failed"
    });
    return null;
  }
}
