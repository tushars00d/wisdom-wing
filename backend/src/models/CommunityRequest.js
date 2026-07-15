import mongoose from "mongoose";

const communityRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["college", "open"],
      required: true
    },
    communityName: { type: String, required: true, trim: true },
    collegeName: String,
    description: { type: String, required: true, trim: true },
    adminName: String,
    adminEmail: String,
    adminDesignation: String,
    proofOfIdUrl: String,
    creatorName: String,
    creatorEmail: String,
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    createdCommunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    rejectionReason: String
  },
  { timestamps: true }
);

communityRequestSchema.index({ status: 1, createdAt: 1 });

export const CommunityRequest =
  mongoose.models.CommunityRequest ?? mongoose.model("CommunityRequest", communityRequestSchema);
