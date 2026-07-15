import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    fullName: String,
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    email: { type: String, required: true, unique: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    passwordHash: String,
    college: String,
    graduationYear: Number,
    status: {
      type: String,
      default: "Student",
      trim: true
    },
    interests: {
      type: [String],
      default: []
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    bio: String,
    avatarUrl: String,
    skills: [String],
    links: {
      github: String,
      portfolio: String,
      linkedin: String
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    collegeIdVerification: {
      status: {
        type: String,
        enum: ["not_submitted", "pending", "approved", "rejected"],
        default: "not_submitted"
      },
      documentUrl: String,
      submittedAt: Date,
      reviewedAt: Date
    },
    joinedCommunities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community"
      }
    ],
    savedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    savedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
      }
    ],
    role: {
      type: String,
      enum: ["user", "college_admin_pending", "college_admin", "superadmin"],
      default: "user",
      index: true
    }
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true, sparse: true });

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
