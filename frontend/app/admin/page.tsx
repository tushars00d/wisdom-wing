"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabs } from "@/components/ui/tabs";
import { adminService, AdminOverviewPayload } from "@/lib/services";

type AdminTab = "communities" | "requests" | "posts" | "events" | "stats";

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverviewPayload | null>(null);
  const [tab, setTab] = useState<AdminTab>("communities");
  const [communityForm, setCommunityForm] = useState({
    name: "",
    description: "",
    college: "",
    tags: ""
  });
  const [announcementForm, setAnnouncementForm] = useState({
    communityId: "",
    title: "",
    content: "",
    isPinned: true
  });
  const [eventForm, setEventForm] = useState({
    communityId: "",
    title: "",
    description: "",
    startsAt: "",
    link: ""
  });

  const loadOverview = () =>
    adminService.overview().then((payload) => {
      setOverview(payload);
      setEventForm((current) => ({
        ...current,
        communityId: current.communityId || payload.communities[0]?._id || ""
      }));
      setAnnouncementForm((current) => ({
        ...current,
        communityId: current.communityId || payload.communities[0]?._id || ""
      }));
    });

  useEffect(() => {
    loadOverview();
  }, []);

  const reviewJoinRequest = async (communityId: string, userId: string, action: "approve" | "reject") => {
    await adminService.reviewJoinRequest(communityId, userId, action);
    await loadOverview();
  };

  const deletePost = async (postId: string) => {
    await adminService.deletePost(postId);
    await loadOverview();
  };

  const createEvent = async () => {
    await adminService.createEvent(eventForm.communityId, eventForm);
    setEventForm((current) => ({ ...current, title: "", description: "", startsAt: "", link: "" }));
    await loadOverview();
  };

  const createCommunity = async () => {
    await adminService.createCommunity({
      name: communityForm.name,
      description: communityForm.description,
      college: communityForm.college,
      tags: communityForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    });
    setCommunityForm({ name: "", description: "", college: "", tags: "" });
    await loadOverview();
  };

  const createAnnouncement = async () => {
    await adminService.createAnnouncement(announcementForm.communityId, announcementForm);
    setAnnouncementForm((current) => ({ ...current, title: "", content: "" }));
    await loadOverview();
  };

  const togglePin = async (postId: string, isPinned: boolean) => {
    await adminService.setPostPinned(postId, isPinned);
    await loadOverview();
  };

  const deleteEvent = async (eventId: string) => {
    await adminService.deleteEvent(eventId);
    await loadOverview();
  };

  const pendingJoinRequests =
    overview?.communities.flatMap((community) =>
      (community.joinRequests ?? [])
        .filter((request) => request.status === "pending")
        .map((request) => ({ community, request }))
    ) ?? [];

  return (
    <AppShell
      title="Community Admin"
      subtitle="A refined operations workspace for growth, moderation, announcements, and event management across your verified communities."
    >
      {!overview ? (
        <Card>Loading admin dashboard...</Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatTile
              label="Managed Communities"
              value={String(overview.communities.length)}
              hint="Active academic spaces under your stewardship."
            />
            <StatTile
              label="Pending Join Requests"
              value={String(pendingJoinRequests.length)}
              hint="Students waiting for entry approval."
            />
            <StatTile
              label="Live Events"
              value={String(overview.events.length)}
              hint="Scheduled sessions and collaboration moments."
            />
          </div>

          <Tabs
            tabs={[
              { label: "Communities", value: "communities" },
              { label: "Join Requests", value: "requests" },
              { label: "Post Moderation", value: "posts" },
              { label: "Events", value: "events" },
              { label: "Stats", value: "stats" }
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === "communities" ? (
            <div id="communities" className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <Card className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Create College Community</p>
                <h3 className="text-2xl font-bold tracking-tight text-text">Launch a clean, focused academic room</h3>
                <FormInput label="Community Name" value={communityForm.name} onChange={(event) => setCommunityForm((current) => ({ ...current, name: event.target.value }))} />
                <FormInput label="College" value={communityForm.college} onChange={(event) => setCommunityForm((current) => ({ ...current, college: event.target.value }))} />
                <FormTextarea label="Description" value={communityForm.description} onChange={(event) => setCommunityForm((current) => ({ ...current, description: event.target.value }))} />
                <FormInput label="Tags" placeholder="DSA, Placements, Web Dev" value={communityForm.tags} onChange={(event) => setCommunityForm((current) => ({ ...current, tags: event.target.value }))} />
                <Button onClick={createCommunity}>Create Community</Button>
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-text">Community Management</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Live roster</span>
                </div>
                {overview.communities.length ? (
                  overview.communities.map((community) => (
                    <div key={community._id} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-5">
                      <p className="text-lg font-semibold text-text">{community.name}</p>
                      <p className="mt-2 text-sm text-textMuted">
                        {community.college} • {community.memberCount ?? 0} members • {community.activePosts ?? 0} active posts
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textMuted">Create your first college community to begin.</p>
                )}
              </Card>
            </div>
          ) : null}

          {tab === "requests" ? (
            <Card id="requests" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-text">Join Requests</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Approval Queue</span>
              </div>
              {pendingJoinRequests.length ? (
                pendingJoinRequests.map(({ community, request }) => (
                  <div key={`${community._id}-${request.userId._id}`} className="grid gap-3 rounded-[20px] border border-border/70 bg-surfaceAlt p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="font-semibold text-text">{request.userId.fullName || request.userId.username}</p>
                      <p className="mt-1 text-sm text-textMuted">
                        {community.name} • {request.userId.college} • {request.userId.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => reviewJoinRequest(community._id, request.userId._id, "approve")}>
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => reviewJoinRequest(community._id, request.userId._id, "reject")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-textMuted">No pending join requests.</p>
              )}
            </Card>
          ) : null}

          {tab === "posts" ? (
            <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <Card className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Create Announcement</p>
                <h3 className="text-2xl font-bold tracking-tight text-text">Publish pinned academic updates</h3>
                <select
                  className="w-full rounded-2xl border border-border bg-surfaceAlt px-4 py-3 text-sm"
                  value={announcementForm.communityId}
                  onChange={(event) => setAnnouncementForm((current) => ({ ...current, communityId: event.target.value }))}
                >
                  {overview.communities.map((community) => (
                    <option key={community._id} value={community._id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                <FormInput label="Title" value={announcementForm.title} onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))} />
                <FormTextarea label="Content" value={announcementForm.content} onChange={(event) => setAnnouncementForm((current) => ({ ...current, content: event.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-textMuted">
                  <input
                    type="checkbox"
                    checked={announcementForm.isPinned}
                    onChange={(event) => setAnnouncementForm((current) => ({ ...current, isPinned: event.target.checked }))}
                  />
                  Pin this announcement
                </label>
                <Button onClick={createAnnouncement}>Publish Announcement</Button>
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-text">Post Moderation</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Clean controls</span>
                </div>
                {overview.posts.length ? (
                  overview.posts.map((post) => (
                    <div key={post._id} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-5">
                      <p className="font-semibold text-text">{post.title}</p>
                      <p className="mt-2 text-sm text-textMuted">
                        {post.postType} • {post.score} score {post.isPinned ? "• pinned" : ""}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => togglePin(post._id, !post.isPinned)}>
                          {post.isPinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button variant="secondary" onClick={() => deletePost(post._id)}>
                          Delete Post
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textMuted">No posts to moderate.</p>
                )}
              </Card>
            </div>
          ) : null}

          {tab === "events" ? (
            <div id="events" className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <Card className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Create Event</p>
                <h3 className="text-2xl font-bold tracking-tight text-text">Plan high-quality community sessions</h3>
                <select
                  className="w-full rounded-2xl border border-border bg-surfaceAlt px-4 py-3 text-sm"
                  value={eventForm.communityId}
                  onChange={(event) => setEventForm((current) => ({ ...current, communityId: event.target.value }))}
                >
                  {overview.communities.map((community) => (
                    <option key={community._id} value={community._id}>
                      {community.name}
                    </option>
                  ))}
                </select>
                <FormInput label="Title" value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} />
                <FormTextarea label="Description" value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} />
                <FormInput label="Date and Time" type="datetime-local" value={eventForm.startsAt} onChange={(event) => setEventForm((current) => ({ ...current, startsAt: event.target.value }))} />
                <FormInput label="Optional Link" value={eventForm.link} onChange={(event) => setEventForm((current) => ({ ...current, link: event.target.value }))} />
                <Button onClick={createEvent}>Create Event</Button>
              </Card>

              <Card className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-text">Event Management</h3>
                {overview.events.map((event) => (
                  <div key={event._id} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-5">
                    <p className="font-semibold text-text">{event.title}</p>
                    <p className="mt-2 text-sm text-textMuted">{new Date(event.startsAt).toLocaleString()}</p>
                    <Button variant="secondary" className="mt-4" onClick={() => deleteEvent(event._id)}>
                      Delete Event
                    </Button>
                  </div>
                ))}
              </Card>
            </div>
          ) : null}

          {tab === "stats" ? (
            <div id="stats" className="space-y-6">
              <MiniBarChart
                title="Community Activity Overview"
                labels={overview.communities.map((community) => community.name.slice(0, 4))}
                values={overview.communities.map((community) => community.activePosts ?? 0)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                {overview.communities.map((community) => (
                  <StatTile
                    key={community._id}
                    label={community.name}
                    value={String(community.memberCount ?? 0)}
                    hint={`${community.activePosts ?? 0} active posts loaded`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
