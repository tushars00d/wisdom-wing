import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postType: {
      type: String,
      enum: ["question", "discussion", "resource"],
      default: "question"
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    resourceUrl: String,
    tags: { type: [String], default: [] },
    isAnonymous: { type: Boolean, default: false },
    isAnnouncement: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ communityId: 1, score: -1, repliesCount: -1 });
postSchema.index({ title: "text", content: "text", tags: "text" });

export const Post = mongoose.models.Post ?? mongoose.model("Post", postSchema);
