import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import type { User } from "firebase/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let currentUser: User | null = null;

  if (typeof window !== "undefined" && isFirebaseConfigured()) {
    const auth = getFirebaseAuth();

    // Wait until Firebase restores the persisted session before reading currentUser.
    await auth.authStateReady();
    currentUser = auth.currentUser;
  }

  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const request = async (forceRefresh = false) => {
    const token = currentUser ? await currentUser.getIdToken(forceRefresh) : null;
    const requestHeaders = new Headers(headers);

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: requestHeaders
    });
  };

  let response = await request();

  // A token cached before a Firebase config change can be rejected by Admin SDK.
  if (response.status === 401 && currentUser) {
    response = await request(true);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}
