"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    graduationYear: "",
    requestedRole: "user" as "user" | "college_admin_pending"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const routeForUser = (syncedUser: Awaited<ReturnType<typeof loginWithGoogle>>) => {
    if (syncedUser?.role === "superadmin") return "/superadmin";
    if (syncedUser?.role === "college_admin") return "/admin";
    if (syncedUser?.role === "college_admin_pending") return "/admin-request";
    if (!syncedUser?.onboardingCompleted) return "/onboarding";
    return "/home";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const syncedUser = await registerWithEmail(form);
      router.push(routeForUser(syncedUser));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-2">
      <section className="hidden bg-surfaceAlt p-12 lg:block">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Step 1 of 2</p>
          <h1 className="text-4xl font-bold">Join your college network.</h1>
          <p className="max-w-lg text-base leading-7 text-textMuted">
            Create an account to unlock verified posting, answers, and community access.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-textMuted">Step 1 of 2: Basic Info</p>
            <h1 className="text-3xl font-bold">Create your account</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 grid gap-3 rounded-xl border border-border bg-bg p-4 md:grid-cols-2">
                <button
                  type="button"
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    form.requestedRole === "user" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setForm((current) => ({ ...current, requestedRole: "user" }))}
                >
                  <span className="block font-semibold">Join as User</span>
                  <span className="text-sm text-textMuted">Ask, answer, join communities, and collaborate.</span>
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    form.requestedRole === "college_admin_pending" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setForm((current) => ({ ...current, requestedRole: "college_admin_pending" }))}
                >
                  <span className="block font-semibold">Join as College Admin</span>
                  <span className="text-sm text-textMuted">Submit verification before managing communities.</span>
                </button>
              </div>
              <input
                className="rounded-lg border border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none"
                placeholder="First name"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              />
              <input
                className="rounded-lg border border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none"
                placeholder="Last name"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              />
              <input
                className="rounded-lg border border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none md:col-span-2"
                placeholder="College email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <input
                className="rounded-lg border border-border bg-bg px-4 py-3 focus:border-primary focus:outline-none md:col-span-2"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Creating account..." : "Create account"}
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
        </Card>
      </section>
    </main>
  );
}
