import mongoose from "mongoose";

const adminRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collegeName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    proofUrl: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    rejectionReason: String
  },
  { timestamps: true }
);

adminRequestSchema.index({ status: 1, createdAt: -1 });
adminRequestSchema.index({ userId: 1, status: 1 });

export const AdminRequest =
  mongoose.models.AdminRequest ?? mongoose.model("AdminRequest", adminRequestSchema);
