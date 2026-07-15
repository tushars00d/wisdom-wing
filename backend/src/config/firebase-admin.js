import admin from "firebase-admin";

function getCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    });
  }

  // If deployed on GCP (where Application Default Credentials work natively),
  // we could return admin.credential.applicationDefault().
  // However, for local development where only verifyIdToken is used, 
  // omitting the credential entirely is safer.
  return undefined;
}

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID
    };

    const credential = getCredential();
    if (credential) {
      config.credential = credential;
    }

    admin.initializeApp(config);
  }

  return admin;
}
