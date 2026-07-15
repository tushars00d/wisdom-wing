import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
    isAiGenerated: { type: Boolean, default: false },
    source_type: {
      type: String,
      enum: ["scraped", "AI", "user"],
      default: "user"
    },
    source_url: String,
    votes: { type: Number, default: 0 },
    feedbackScore: { type: Number, default: 0 },
    bestAnswerAt: Date
  },
  { timestamps: true }
);

answerSchema.index({ questionId: 1, createdAt: 1 });

export const Answer = mongoose.models.Answer ?? mongoose.model("Answer", answerSchema);
