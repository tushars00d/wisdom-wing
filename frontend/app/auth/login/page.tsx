"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const routeForUser = (syncedUser: Awaited<ReturnType<typeof loginWithEmail>>) => {
    if (syncedUser?.role === "superadmin") return "/superadmin";
    if (syncedUser?.role === "college_admin") return "/admin";
    if (syncedUser?.role === "college_admin_pending") return "/admin-request";
    if (!syncedUser?.onboardingCompleted) return "/onboarding";
    return "/home";
  };

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const syncedUser = await loginWithEmail(email, password);
      router.push(routeForUser(syncedUser));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-2">
      <section className="hidden bg-gradient-to-br from-primary to-accentAlt p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-2xl font-bold">Wisdom Wing</div>
        <div className="max-w-lg space-y-4">
          <h1 className="text-4xl font-bold">Your campus network, rebuilt around trust.</h1>
          <p className="text-sm leading-7 text-white/85">
            Learn from seniors, collaborate with peers, and surface the best academic help without the
            clutter.
          </p>
        </div>
        <p className="text-sm text-white/75">“The first platform that felt genuinely useful for college life.”</p>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md space-y-6">
          <div>
            <p className="text-sm text-textMuted">Welcome back</p>
            <h1 className="text-3xl font-bold">Log in</h1>
          </div>
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <input
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none ring-0 focus:border-primary"
              placeholder="College email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none ring-0 focus:border-primary"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Continue"}
            </Button>
          </form>
          <Button
            variant="secondary"
            className="w-full"
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                const syncedUser = await loginWithGoogle();
                router.push(routeForUser(syncedUser));
              } catch (caughtError) {
                setError(caughtError instanceof Error ? caughtError.message : "Unable to continue");
              } finally {
                setLoading(false);
              }
            }}
          >
            Continue with Google
          </Button>
          <p className="text-sm text-textMuted">
            Need an account?{" "}
            <Link href="/auth/signup" className="text-primary">
              Sign up
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
