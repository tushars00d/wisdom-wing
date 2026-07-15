import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    tags: { type: [String], default: [] },
    type: {
      type: String,
      enum: ["college", "open"],
      required: true
    },
    isHidden: { type: Boolean, default: false },
    isFrozen: { type: Boolean, default: false },
    college: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    joinRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending"
        },
        requestedAt: { type: Date, default: Date.now },
        reviewedAt: Date
      }
    ],
    pendingVerificationUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

communitySchema.index({ name: "text", description: "text", college: "text", tags: "text" });

export const Community =
  mongoose.models.Community ?? mongoose.model("Community", communitySchema);
