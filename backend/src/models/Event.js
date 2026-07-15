import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["community", "personal"],
      required: true,
      default: "community"
    },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    link: String,
    attendeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

eventSchema.index({ type: 1, communityId: 1, startsAt: 1 });
eventSchema.index({ creatorId: 1, startsAt: 1 });

export const Event = mongoose.models.Event ?? mongoose.model("Event", eventSchema);
