"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { Community } from "@/lib/types";
import { communityService } from "@/lib/services";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [requestForm, setRequestForm] = useState({
    type: "open" as "open" | "college",
    communityName: "",
    collegeName: "",
    description: "",
    adminName: "",
    adminEmail: "",
    adminDesignation: "",
    proofOfIdUrl: "",
    creatorName: "",
    creatorEmail: ""
  });
  const [isPending, startTransition] = useTransition();

  const loadCommunities = (nextQuery = query) => {
    startTransition(async () => {
      const data = await communityService.list(nextQuery);
      setCommunities(data.communities);
    });
  };

  useEffect(() => {
    loadCommunities("");
  }, []);

  const submitCommunityRequest = async () => {
    setMessage("");
    await communityService.requestCreate(requestForm);
    setMessage("Community creation request submitted for review.");
    setRequestForm({
      type: "open",
      communityName: "",
      collegeName: "",
      description: "",
      adminName: "",
      adminEmail: "",
      adminDesignation: "",
      proofOfIdUrl: "",
      creatorName: "",
      creatorEmail: ""
    });
  };

  const join = async (communityId: string) => {
    setMessage("");
    const response = await communityService.join(communityId);
    setMessage(response.status === "pending" ? "Join request submitted for approval." : "Joined community.");
    loadCommunities();
  };

  return (
    <AppShell
      title="Discover & Collaborate"
      subtitle="Request new focused spaces, discover high-signal communities, and enter collaboration rooms built for academic momentum."
      rightRail={
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Top 10 Communities</p>
          {communities.length ? (
            communities.slice(0, 10).map((community, index) => (
              <Card key={community._id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      #{String(index + 1).padStart(2, "0")}
                    </p>
                    <Link href={`/community/${community._id}`} className="mt-2 block text-xl font-semibold text-text">
                      {community.name}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-textMuted">{community.description}</p>
                    <p className="mt-4 text-sm text-textMuted">
                      {community.memberCount ?? 0} members • {community.type}
                      {community.college ? ` • ${community.college}` : ""}
                    </p>
                  </div>
                  {community.isMember ? (
                    <Link href={`/community/${community._id}`}>
                      <Button variant="secondary">Open</Button>
                    </Link>
                  ) : community.joinRequestPending ? (
                    <Button variant="secondary" disabled>
                      Pending
                    </Button>
                  ) : (
                    <Button onClick={() => join(community._id)}>
                      {community.type === "college" ? "Request Join" : "Join"}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : !isPending ? (
            <Card>
              <p className="text-sm text-textMuted">No communities found.</p>
            </Card>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Request a Community</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text">Build the next serious study space</h2>
          </div>

          <select
            className="w-full rounded-2xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-text"
            value={requestForm.type}
            onChange={(event) =>
              setRequestForm((current) => ({ ...current, type: event.target.value as "open" | "college" }))
            }
          >
            <option value="open">Open Community</option>
            <option value="college">College Community</option>
          </select>

          <FormInput
            label="Community Name"
            value={requestForm.communityName}
            onChange={(event) => setRequestForm((current) => ({ ...current, communityName: event.target.value }))}
          />
          <FormTextarea
            label="Description"
            value={requestForm.description}
            onChange={(event) => setRequestForm((current) => ({ ...current, description: event.target.value }))}
          />

          {requestForm.type === "college" ? (
            <>
              <FormInput
                label="College Name"
                value={requestForm.collegeName}
                onChange={(event) => setRequestForm((current) => ({ ...current, collegeName: event.target.value }))}
              />
              <FormInput
                label="Admin Name"
                value={requestForm.adminName}
                onChange={(event) => setRequestForm((current) => ({ ...current, adminName: event.target.value }))}
              />
              <FormInput
                label="Admin Email"
                value={requestForm.adminEmail}
                onChange={(event) => setRequestForm((current) => ({ ...current, adminEmail: event.target.value }))}
              />
              <FormInput
                label="Admin Designation"
                value={requestForm.adminDesignation}
                onChange={(event) => setRequestForm((current) => ({ ...current, adminDesignation: event.target.value }))}
              />
              <FormInput
                label="Proof of ID Link"
                value={requestForm.proofOfIdUrl}
                onChange={(event) => setRequestForm((current) => ({ ...current, proofOfIdUrl: event.target.value }))}
              />
            </>
          ) : (
            <>
              <FormInput
                label="Creator Name"
                value={requestForm.creatorName}
                onChange={(event) => setRequestForm((current) => ({ ...current, creatorName: event.target.value }))}
              />
              <FormInput
                label="Creator Email"
                value={requestForm.creatorEmail}
                onChange={(event) => setRequestForm((current) => ({ ...current, creatorEmail: event.target.value }))}
              />
            </>
          )}

          {message ? <p className="text-sm text-primary">{message}</p> : null}
          <Button className="w-full" onClick={submitCommunityRequest}>
            Submit Request
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_60%,#eef7ff_100%)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Community Search</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text">Find the right room for your academic goals</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-textMuted">
              Browse focused communities for placements, DSA, research, web development, projects, and campus collaboration.
            </p>
            <div className="mt-6">
              <FormInput
                label="Search communities"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  loadCommunities(event.target.value);
                }}
                placeholder="Search by community name, college, or tag"
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text">Premium Discovery</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">
                {communities.length} listed
              </span>
            </div>
            {isPending ? <p className="text-sm text-textMuted">Refreshing communities…</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
              {communities.slice(0, 6).map((community) => (
                <Card key={community._id} className="bg-surfaceAlt shadow-none">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {community.type}
                  </p>
                  <Link href={`/community/${community._id}`} className="mt-3 block text-xl font-semibold text-text">
                    {community.name}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-textMuted">{community.description}</p>
                  <p className="mt-4 text-sm text-textMuted">
                    {community.memberCount ?? 0} members
                    {community.college ? ` • ${community.college}` : ""}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
