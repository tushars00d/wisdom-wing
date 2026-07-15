import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { AdminRequest } from "../../models/AdminRequest.js";
import { User } from "../../models/User.js";
import { getCurrentUser } from "../../services/user.service.js";

export const adminRequestRouter = Router();

adminRequestRouter.post("/", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);
  const { collegeName, designation, proofUrl, reason } = req.body;

  if (!currentUser) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (currentUser.role === "superadmin") {
    return res.status(400).json({ message: "Superadmin cannot request college admin access." });
  }

  if (!collegeName || !designation || !proofUrl || !reason) {
    return res.status(400).json({ message: "College name, designation, proof, and reason are required." });
  }

  if (String(proofUrl).length > 1_800_000) {
    return res.status(413).json({ message: "Proof file is too large. Upload a compressed file under 1.3MB." });
  }

  const existingPendingRequest = await AdminRequest.findOne({
    userId: currentUser._id,
    status: "pending"
  }).lean();

  if (existingPendingRequest) {
    return res.status(409).json({ message: "You already have a pending admin request." });
  }

  const request = await AdminRequest.create({
    userId: currentUser._id,
    collegeName: collegeName.trim(),
    designation: designation.trim(),
    proofUrl,
    reason: reason.trim()
  });

  await User.findByIdAndUpdate(currentUser._id, { role: "college_admin_pending" });

  res.status(201).json({ request });
});
