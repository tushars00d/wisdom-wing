import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    tags: [String],
    isAnonymous: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    embedding: [Number],
    answersCount: { type: Number, default: 0 },
    autoAnswerStatus: {
      type: String,
      enum: ["idle", "scheduled", "processing", "completed", "skipped", "failed"],
      default: "idle"
    },
    autoAnsweredAt: Date,
    aiSummaryStatus: {
      type: String,
      enum: ["idle", "queued", "generated", "dismissed"],
      default: "idle"
    }
  },
  { timestamps: true }
);

export const Question = mongoose.models.Question ?? mongoose.model("Question", questionSchema);
