import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey);
}

function ensureFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client auth can only run in the browser.");
  }

  if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase web config. Fill frontend/.env.local first.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  if (!authInstance) {
    authInstance = getAuth(ensureFirebaseApp());
  }

  return authInstance;
}

export function getGoogleProvider() {
  if (!providerInstance) {
    providerInstance = new GoogleAuthProvider();
  }

  return providerInstance;
}
