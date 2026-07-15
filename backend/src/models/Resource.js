import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["pdf", "doc", "link"], required: true },
    url: String,
    description: String,
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    branch: String,
    year: String,
    subject: String,
    tags: [String],
    score: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Resource = mongoose.models.Resource ?? mongoose.model("Resource", resourceSchema);
