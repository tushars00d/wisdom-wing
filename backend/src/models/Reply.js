import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["post", "resource"],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    source_type: {
      type: String,
      enum: ["scraped", "AI", "user"],
      default: "user"
    },
    source_url: String
  },
  { timestamps: true }
);

replySchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

export const Reply = mongoose.models.Reply ?? mongoose.model("Reply", replySchema);
