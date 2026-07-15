import { getFirebaseAdmin } from "../config/firebase-admin.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Firebase ID token." });
    }

    const idToken = header.slice("Bearer ".length);
    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired Firebase token.",
      error: error instanceof Error ? error.message : "Unknown auth error"
    });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const idToken = header.slice("Bearer ".length);

  getFirebaseAdmin()
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch(() => next());
}
