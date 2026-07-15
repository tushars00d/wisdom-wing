import mongoose from "mongoose";

const knowledgeBaseChunkSchema = new mongoose.Schema(
  {
    sourceType: { type: String, enum: ["answer", "resource", "policy"], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: {
      college: String,
      subject: String,
      trustLevel: String
    }
  },
  { timestamps: true }
);

export const KnowledgeBaseChunk =
  mongoose.models.KnowledgeBaseChunk ??
  mongoose.model("KnowledgeBaseChunk", knowledgeBaseChunkSchema);
