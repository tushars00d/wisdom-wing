"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  updatePassword,
  type User
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { AppUser } from "@/lib/types";

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  graduationYear: string;
  requestedRole: "user" | "college_admin_pending";
};

type AuthContextValue = {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  refreshAppUser: () => Promise<AppUser | null>;
  registerWithEmail: (input: RegisterInput) => Promise<AppUser | null>;
  loginWithEmail: (email: string, password: string) => Promise<AppUser | null>;
  loginWithGoogle: () => Promise<AppUser | null>;
  changePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncUserProfile(extra?: Partial<RegisterInput>) {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const currentUser = getFirebaseAuth().currentUser;

  if (!currentUser) {
    return null;
  }

  const response = await apiFetch<{ user: AppUser }>("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({
      firstName: extra?.firstName ?? currentUser.displayName?.split(" ")[0] ?? "",
      lastName: extra?.lastName ?? currentUser.displayName?.split(" ").slice(1).join(" ") ?? "",
      email: currentUser.email,
      graduationYear: extra?.graduationYear ? Number(extra.graduationYear) : undefined,
      avatarUrl: currentUser.photoURL ?? null,
      requestedRole: extra?.requestedRole
    })
  });

  return response.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        try {
          const syncedUser = await syncUserProfile();
          setAppUser(syncedUser);
        } catch (error) {
          console.error("Failed to sync session", error);
        }
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      appUser,
      loading,
      refreshAppUser: async () => {
        const syncedUser = await syncUserProfile();
        setAppUser(syncedUser);
        return syncedUser;
      },
      registerWithEmail: async ({ firstName, lastName, email, password, graduationYear, requestedRole }) => {
        if (!isFirebaseConfigured()) {
          throw new Error("Firebase web config is required for signup.");
        }

        const auth = getFirebaseAuth();
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, {
          displayName: `${firstName} ${lastName}`.trim()
        });
        await sendEmailVerification(credential.user);
        const syncedUser = await syncUserProfile({ firstName, lastName, email, graduationYear, requestedRole });
        setAppUser(syncedUser);
        return syncedUser;
      },
      loginWithEmail: async (email, password) => {
        if (!isFirebaseConfigured()) {
          throw new Error("Firebase web config is required for login.");
        }

        const auth = getFirebaseAuth();
        await signInWithEmailAndPassword(auth, email, password);
        const syncedUser = await syncUserProfile();
        setAppUser(syncedUser);
        return syncedUser;
      },
      loginWithGoogle: async () => {
        if (!isFirebaseConfigured()) {
          throw new Error("Firebase web config is required for Google login.");
        }

        const auth = getFirebaseAuth();
        await signInWithPopup(auth, getGoogleProvider());
        const syncedUser = await syncUserProfile();
        setAppUser(syncedUser);
        return syncedUser;
      },
      changePassword: async (password) => {
        if (!isFirebaseConfigured()) {
          throw new Error("Firebase web config is required to change password.");
        }

        const currentUser = getFirebaseAuth().currentUser;

        if (!currentUser) {
          throw new Error("Sign in again before changing password.");
        }

        await updatePassword(currentUser, password);
      },
      logout: async () => {
        if (!isFirebaseConfigured()) {
          setAppUser(null);
          return;
        }

        await signOut(getFirebaseAuth());
        setAppUser(null);
      }
    }),
    [appUser, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
