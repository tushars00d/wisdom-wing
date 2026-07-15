import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { User } from "../../models/User.js";
import { serializeUser } from "../../services/user.service.js";
import { isSuperadminEmail } from "../../config/superadmin.js";

export const authRouter = Router();

authRouter.post("/signup", (_req, res) => {
  res.status(201).json({ message: "Create account and trigger verification workflow." });
});

authRouter.post("/login", (_req, res) => {
  res.json({ message: "Issue auth token and session metadata." });
});

authRouter.post("/session", requireAuth, async (req, res) => {
  const { uid, email, name, picture } = req.user;
  const { firstName, lastName, graduationYear, avatarUrl, requestedRole } = req.body;

  const isSuperadmin = isSuperadminEmail(email);
  const defaultRole = requestedRole === "college_admin_pending" ? "college_admin_pending" : "user";
  const update = {
    $set: {
      firebaseUid: uid,
      email,
      avatarUrl: avatarUrl || picture || null,
      ...(isSuperadmin ? { role: "superadmin" } : {})
    },
    $setOnInsert: {
      firstName: firstName || name?.split(" ")[0] || "",
      lastName: lastName || name?.split(" ").slice(1).join(" ") || "",
      fullName: [firstName || name?.split(" ")[0], lastName || name?.split(" ").slice(1).join(" ")]
        .filter(Boolean)
        .join(" "),
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      ...(!isSuperadmin ? { role: defaultRole } : {})
    }
  };

  const user = await User.findOneAndUpdate(
    { firebaseUid: uid },
    update,
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  if (!isSuperadmin && user.role === "superadmin") {
    user.role = "user";
    await user.save();
  } else if (!user.role) {
    user.role = isSuperadmin ? "superadmin" : defaultRole;
    await user.save();
  }

  res.json({
    message: "Firebase session synced.",
    user: serializeUser(user)
  });
});

authRouter.post("/verify-college-id", (_req, res) => {
  res.json({ message: "Upload college ID and enqueue admin verification." });
});
