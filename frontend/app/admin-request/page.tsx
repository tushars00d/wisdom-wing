"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { adminRequestService } from "@/lib/services";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read proof file."));
    reader.readAsDataURL(file);
  });
}

export default function AdminRequestPage() {
  const router = useRouter();
  const { appUser, refreshAppUser, logout } = useAuth();
  const [form, setForm] = useState({
    collegeName: "",
    designation: "",
    proofUrl: "",
    reason: ""
  });
  const [proofName, setProofName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await adminRequestService.submit(form);
      await refreshAppUser();
      setMessage("Your college admin request is pending superadmin review.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 text-text">
      <Card className="w-full max-w-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">College Admin Verification</p>
          <h1 className="text-3xl font-bold">Request admin access</h1>
          <p className="text-sm text-textMuted">
            Submit your college affiliation proof. You can access the admin dashboard after superadmin approval.
          </p>
        </div>

        {appUser?.role === "college_admin" ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="font-medium text-emerald-600">Your request is approved.</p>
            <Button className="mt-3" onClick={() => router.push("/admin")}>
              Open Admin Dashboard
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <FormInput
              label="College Name"
              value={form.collegeName}
              onChange={(event) => setForm((current) => ({ ...current, collegeName: event.target.value }))}
              required
            />
            <FormInput
              label="Designation"
              value={form.designation}
              onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))}
              placeholder="Faculty coordinator, club lead, placement cell member..."
              required
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text">Proof of ID</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1_300_000) {
                    setError("Please upload a compressed proof file under 1.3MB.");
                    return;
                  }
                  setProofName(file.name);
                  const dataUrl = await readFileAsDataUrl(file);
                  setForm((current) => ({ ...current, proofUrl: dataUrl }));
                }}
                required={!form.proofUrl}
              />
              {proofName ? <span className="text-xs text-textMuted">Selected: {proofName}</span> : null}
            </label>
            <FormTextarea
              label="Reason for Request"
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              placeholder="Explain why you need admin access and which community you plan to manage."
              required
            />
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Admin Request"}
            </Button>
          </form>
        )}

        <button
          className="text-sm text-textMuted hover:text-text"
          onClick={async () => {
            await logout();
            router.push("/auth/login");
          }}
        >
          Log out
        </button>
      </Card>
    </main>
  );
}
