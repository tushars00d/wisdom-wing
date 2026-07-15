import { Router } from "express";
import { runAutoAnswerForQuestion, scheduleAiFallbackJob } from "../../jobs/ai-answer.job.js";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { Answer } from "../../models/Answer.js";
import { Question } from "../../models/Question.js";
import { User } from "../../models/User.js";
import { createAnswer, serializeAnswer } from "../../services/answer.service.js";
import { buildAiSummaryPrompt, buildDuplicateSearchPayload } from "../../services/ai.service.js";
import { findDuplicateQuestions, prepareQuestionDocument } from "../../services/search.service.js";

export const questionRouter = Router();

questionRouter.get("/", optionalAuth, async (_req, res) => {
  const questions = await Question.find({}, { title: 1, body: 1, tags: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({ questions });
});

questionRouter.post("/", requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid }).lean();

  if (!user) {
    return res.status(404).json({ message: "Authenticated user is not synced yet." });
  }

  const questionPayload = await prepareQuestionDocument(req.body, user._id);
  questionPayload.autoAnswerStatus = "scheduled";
  const question = await Question.create(questionPayload);
  runAutoAnswerForQuestion(question._id).catch(console.error);
  const duplicateMatches = await findDuplicateQuestions(req.body.title ?? "");
  const duplicateSearch = buildDuplicateSearchPayload(req.body.title ?? "");
  const aiJob = scheduleAiFallbackJob(String(question._id));

  res.status(201).json({
    message: "Question created, indexed, and auto-answered.",
    question,
    duplicateSearch,
    duplicateMatches,
    aiJob
  });
});

questionRouter.get("/:questionId", async (req, res) => {
  const question = await Question.findById(req.params.questionId).lean();

  if (!question) {
    return res.status(404).json({ message: "Question not found." });
  }

  const answers = await Answer.find({ questionId: question._id })
    .populate("authorId", "username fullName status")
    .sort({ createdAt: 1 })
    .lean();

  const aiPrompt = buildAiSummaryPrompt({
    title: question.title,
    contextChunks: [
      "Curated senior roadmap with arrays, strings, recursion, and weekly revision.",
      "Past accepted answer emphasizing small daily consistency targets."
    ]
  });

  res.json({
    question,
    answers: answers.map(serializeAnswer),
    aiPrompt
  });
});

questionRouter.post("/:questionId/answers", requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid }).lean();
  const question = await Question.findById(req.params.questionId).lean();
  const body = String(req.body.body ?? "").trim();

  if (!user || !question) {
    return res.status(404).json({ message: "Question or user not found." });
  }

  if (!body) {
    return res.status(400).json({ message: "Answer body is required." });
  }

  const answer = await createAnswer({
    questionId: question._id,
    body,
    authorId: user._id,
    sourceType: "user"
  });

  await Question.findByIdAndUpdate(question._id, {
    autoAnswerStatus: "skipped"
  });

  res.status(201).json({ answer: serializeAnswer(answer) });
});
