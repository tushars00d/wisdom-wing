"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { superadminService, SuperadminOverviewPayload } from "@/lib/services";

type SuperadminTab = "requests" | "communities" | "users" | "stats";

export default function SuperadminPage() {
  const [overview, setOverview] = useState<SuperadminOverviewPayload | null>(null);
  const [tab, setTab] = useState<SuperadminTab>("requests");

  const loadOverview = () => superadminService.overview().then(setOverview);

  useEffect(() => {
    loadOverview();
  }, []);

  const reviewAdminRequest = async (requestId: string, action: "approve" | "reject") => {
    await superadminService.reviewAdminRequest(requestId, action);
    await loadOverview();
  };

  const reviewRequest = async (requestId: string, action: "approve" | "reject") => {
    await superadminService.reviewCommunityRequest(requestId, action);
    await loadOverview();
  };

  const assignRole = async (userId: string, role: "user" | "college_admin_pending" | "college_admin") => {
    await superadminService.updateUserRole(userId, role);
    await loadOverview();
  };

  const moderateCommunity = async (
    communityId: string,
    action: "hide" | "unhide" | "freeze" | "unfreeze" | "delete"
  ) => {
    await superadminService.moderateCommunity(communityId, action);
    await loadOverview();
  };

  return (
    <AppShell title="Superadmin" subtitle="Full platform control for Wisdom Wing.">
      {!overview ? (
        <Card>Loading superadmin dashboard...</Card>
      ) : (
        <div className="space-y-5">
          <Tabs
            tabs={[
              { label: "Admin Requests", value: "requests" },
              { label: "Communities", value: "communities" },
              { label: "Users", value: "users" },
              { label: "Stats", value: "stats" }
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === "requests" ? (
            <div className="space-y-5">
              <Card className="space-y-4">
                <h3 className="text-xl font-semibold">Pending College Admin Requests</h3>
                {overview.adminRequests.length ? (
                  overview.adminRequests.map((request) => (
                    <div key={request._id} className="rounded-lg border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{request.userId?.fullName || request.userId?.email}</p>
                          <p className="text-sm text-textMuted">
                            {request.collegeName} • {request.designation} • {request.status}
                          </p>
                          <p className="mt-2 text-sm text-textMuted">{request.reason}</p>
                          <a href={request.proofUrl} target="_blank" className="mt-2 inline-block text-sm text-primary">
                            Open proof
                          </a>
                        </div>
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button onClick={() => reviewAdminRequest(request._id, "approve")}>Approve</Button>
                            <Button variant="secondary" onClick={() => reviewAdminRequest(request._id, "reject")}>
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textMuted">No college admin requests yet.</p>
                )}
              </Card>

              <Card className="space-y-4">
                <h3 className="text-xl font-semibold">Community Creation Requests</h3>
                {overview.requests.length ? (
                  overview.requests.map((request) => (
                    <div key={request._id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{request.communityName}</p>
                        <p className="text-sm text-textMuted">
                          {request.type} {request.collegeName ? `• ${request.collegeName}` : ""} • {request.status}
                        </p>
                        <p className="mt-2 text-sm text-textMuted">{request.description}</p>
                        {request.proofOfIdUrl ? (
                          <a href={request.proofOfIdUrl} target="_blank" className="mt-2 inline-block text-sm text-primary">
                            Open proof
                          </a>
                        ) : null}
                      </div>
                      {request.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button onClick={() => reviewRequest(request._id, "approve")}>Approve</Button>
                          <Button variant="secondary" onClick={() => reviewRequest(request._id, "reject")}>
                            Reject
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-sm text-textMuted">No community requests yet.</p>
                )}
              </Card>
            </div>
          ) : null}

          {tab === "communities" ? (
            <Card className="space-y-4">
              <h3 className="text-xl font-semibold">Communities Management</h3>
              {overview.communities.map((community) => (
                <div key={community._id} className="rounded-lg border border-border p-4">
                  <p className="font-semibold">{community.name}</p>
                  <p className="text-sm text-textMuted">
                    {community.type} • {community.memberCount ?? 0} members
                    {community.isHidden ? " • hidden" : ""}
                    {community.isFrozen ? " • frozen" : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => moderateCommunity(community._id, community.isHidden ? "unhide" : "hide")}
                    >
                      {community.isHidden ? "Unhide" : "Hide"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => moderateCommunity(community._id, community.isFrozen ? "unfreeze" : "freeze")}
                    >
                      {community.isFrozen ? "Unfreeze" : "Freeze"}
                    </Button>
                    <Button variant="secondary" onClick={() => moderateCommunity(community._id, "delete")}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          ) : null}

          {tab === "users" ? (
            <Card className="space-y-4">
              <h3 className="text-xl font-semibold">User Management</h3>
              {overview.users.map((user) => (
                <div key={user._id} className="rounded-lg border border-border p-4">
                  <p className="font-semibold">{user.fullName || user.username || user.email}</p>
                  <p className="text-sm text-textMuted">{user.email} • {user.role}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => assignRole(user._id, "user")}>
                      User
                    </Button>
                    <Button variant="secondary" onClick={() => assignRole(user._id, "college_admin_pending")}>
                      Pending Admin
                    </Button>
                    <Button variant="secondary" onClick={() => assignRole(user._id, "college_admin")}>
                      College Admin
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          ) : null}

          {tab === "stats" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <p className="text-sm text-textMuted">Total Users</p>
                <p className="mt-2 text-3xl font-bold">{overview.stats.totalUsers}</p>
              </Card>
              <Card>
                <p className="text-sm text-textMuted">Total Communities</p>
                <p className="mt-2 text-3xl font-bold">{overview.stats.totalCommunities}</p>
              </Card>
              <Card>
                <p className="text-sm text-textMuted">Total Posts</p>
                <p className="mt-2 text-3xl font-bold">{overview.stats.totalPosts}</p>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
