"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { colleges, interests, statuses } from "@/lib/options";
import { userService } from "@/lib/services";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, appUser, loading, refreshAppUser } = useAuth();
  const [form, setForm] = useState({
    fullName: appUser?.fullName ?? user?.displayName ?? "",
    username: appUser?.username ?? "",
    college: appUser?.college ?? "",
    status: appUser?.status ?? "Student",
    interests: appUser?.interests ?? []
  });
  const [customCollege, setCustomCollege] = useState("");
  const [customStatus, setCustomStatus] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (appUser?.onboardingCompleted) {
      router.replace("/home");
    }
  }, [appUser, router]);

  const filteredColleges = useMemo(
    () =>
      colleges.filter((college) =>
        college.toLowerCase().includes(collegeSearch.trim().toLowerCase())
      ),
    [collegeSearch]
  );

  const toggleInterest = (interest: string) => {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest]
    }));
  };

  const checkUsername = async (username: string) => {
    setForm((current) => ({ ...current, username }));
    setUsernameMessage("");

    if (username.length < 3) return;

    try {
      const result = await userService.checkUsername(username);
      setUsernameMessage(result.available ? "Username is available" : "Username is already taken");
    } catch (caughtError) {
      setUsernameMessage(caughtError instanceof Error ? caughtError.message : "Unable to validate username");
    }
  };

  const submit = async () => {
    setError("");

    const finalCollege = form.college === "Other" ? customCollege.trim() : form.college;
    const finalStatus = form.status === "Other" ? customStatus.trim() : form.status;

    if (!form.fullName || !form.username || !finalCollege || !finalStatus) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      await userService.completeOnboarding({
        ...form,
        college: finalCollege,
        status: finalStatus
      });
      await refreshAppUser();
      router.replace("/home");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-textMuted">
        Loading onboarding...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-text">
      <Card className="w-full max-w-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Step 1 of 1</p>
          <h1 className="text-3xl font-bold">Complete your Wisdom Wing profile</h1>
          <p className="text-sm text-textMuted">
            This keeps communities trusted and helps personalize your feed later.
          </p>
        </div>

        <div className="h-2 rounded-full bg-surfaceAlt">
          <div className="h-2 w-full rounded-full bg-primary" />
        </div>

        <div className="grid gap-4">
          <FormInput
            label="Full Name"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Your full name"
          />
          <FormInput
            label="Username"
            value={form.username}
            onChange={(event) => checkUsername(event.target.value.toLowerCase())}
            placeholder="lowercase_username"
          />
          {usernameMessage ? (
            <p className={usernameMessage.includes("available") ? "text-xs text-success" : "text-xs text-rose-500"}>
              {usernameMessage}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium">College</label>
            <input
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Search your college"
              value={collegeSearch || form.college}
              onChange={(event) => {
                setCollegeSearch(event.target.value);
                setForm((current) => ({ ...current, college: "" }));
              }}
            />
            <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-surface">
              {filteredColleges.map((college) => (
                <button
                  key={college}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-surfaceAlt"
                  onClick={() => {
                    setForm((current) => ({ ...current, college }));
                    setCollegeSearch("");
                  }}
                >
                  {college}
                </button>
              ))}
            </div>
            {form.college === "Other" ? (
              <FormInput
                label="Custom College"
                value={customCollege}
                onChange={(event) => setCustomCollege(event.target.value)}
                placeholder="Enter your college name"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setForm((current) => ({ ...current, status }))}
                  className={
                    form.status === status
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
                      : "rounded-full border border-border px-4 py-2 text-sm text-textMuted"
                  }
                >
                  {status}
                </button>
              ))}
            </div>
            {form.status === "Other" ? (
              <FormInput
                label="Custom Status"
                value={customStatus}
                onChange={(event) => setCustomStatus(event.target.value)}
                placeholder="Research Intern, Teaching Assistant..."
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={
                    form.interests.includes(interest)
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
                      : "rounded-full border border-border px-4 py-2 text-sm text-textMuted"
                  }
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <Button className="w-full" onClick={submit} disabled={submitting}>
          {submitting ? "Saving..." : "Enter Wisdom Wing"}
        </Button>
      </Card>
    </main>
  );
}
