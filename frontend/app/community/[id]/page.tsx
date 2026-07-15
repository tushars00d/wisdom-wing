"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { Tabs } from "@/components/ui/tabs";
import { Tag } from "@/components/ui/tag";
import { CommunityDetailPayload, communityService } from "@/lib/services";

type CommunityTab = "home" | "posts" | "resources" | "events";

export default function CommunityDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CommunityDetailPayload | null>(null);
  const [tab, setTab] = useState<CommunityTab>("home");
  const [message, setMessage] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    postType: "question" as "question" | "discussion" | "resource",
    resourceUrl: "",
    tags: "",
    isAnonymous: false
  });
  const [resourceForm, setResourceForm] = useState({ title: "", url: "", description: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", startsAt: "", link: "" });

  const communityId = params.id;

  const loadCommunity = async () => {
    const payload = await communityService.get(communityId);
    setData(payload);
  };

  useEffect(() => {
    loadCommunity();
  }, [communityId]);

  const upcomingEvents = useMemo(
    () => data?.events.filter((event) => new Date(event.startsAt) >= new Date()) ?? [],
    [data]
  );
  const pastEvents = useMemo(
    () => data?.events.filter((event) => new Date(event.startsAt) < new Date()) ?? [],
    [data]
  );

  if (!data) {
    return (
      <AppShell title="Community" subtitle="Loading community...">
        <Card>Loading community...</Card>
      </AppShell>
    );
  }

  const { community } = data;

  const joinCommunity = async () => {
    setMessage("");
    try {
      const response = await communityService.join(communityId);
      setMessage(response.status === "pending" ? "Join request submitted for approval." : "Joined community.");
      await loadCommunity();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : "Unable to join community");
    }
  };

  const submitVerification = async () => {
    setMessage("");
    await communityService.submitVerification(communityId, verificationUrl);
    setVerificationUrl("");
    setMessage("Verification request submitted for admin approval.");
    await loadCommunity();
  };

  const createPost = async () => {
    await communityService.createPost(communityId, {
      title: postForm.title,
      content: postForm.content,
      postType: postForm.postType,
      resourceUrl: postForm.resourceUrl,
      tags: postForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      isAnonymous: postForm.isAnonymous
    });
    setPostForm({ title: "", content: "", postType: "question", resourceUrl: "", tags: "", isAnonymous: false });
    setTab("posts");
    await loadCommunity();
  };

  const createResource = async () => {
    await communityService.createResource(communityId, resourceForm);
    setResourceForm({ title: "", url: "", description: "" });
    await loadCommunity();
  };

  const createEvent = async () => {
    await communityService.createEvent(communityId, eventForm);
    setEventForm({ title: "", description: "", startsAt: "", link: "" });
    await loadCommunity();
  };

  const joinEvent = async (eventId: string) => {
    await communityService.joinEvent(communityId, eventId);
    await loadCommunity();
  };

  const reviewJoinRequest = async (userId: string, action: "approve" | "reject") => {
    setMessage("");
    try {
      await communityService.reviewJoinRequest(communityId, userId, action);
      setMessage(`Join request ${action}d.`);
      await loadCommunity();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : "Unable to review request");
    }
  };

  const rightRail = (
    <>
      <Card className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Community Profile</p>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-text">{community.name}</h3>
          <p className="mt-2 text-sm leading-6 text-textMuted">
            {community.college ? `${community.college} • ` : ""}
            {community.memberCount ?? 0} members • {community.type}
          </p>
        </div>
        <div className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4">
          <p className="text-sm font-semibold text-text">Admin Name</p>
          <p className="mt-2 text-sm text-textMuted">
            {community.isAdmin ? "You are managing this community" : "Admin: Prof. Khanna"}
          </p>
        </div>
        <Button className="w-full" onClick={() => setTab("posts")}>
          Post a Question
        </Button>
        {!community.isMember && !community.joinRequestPending ? (
          <Button variant="secondary" className="w-full" onClick={joinCommunity}>
            {community.type === "college" ? "Request Join" : "Join Community"}
          </Button>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Community Quick Facts</h3>
        <div className="grid gap-3">
          <div className="rounded-[18px] border border-border/70 bg-surfaceAlt p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">Top Questions</p>
            <p className="mt-2 text-2xl font-bold text-text">{data.home.topUnansweredPosts.length}</p>
          </div>
          <div className="rounded-[18px] border border-border/70 bg-surfaceAlt p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">Upcoming Events</p>
            <p className="mt-2 text-2xl font-bold text-text">{upcomingEvents.length}</p>
          </div>
        </div>
      </Card>
    </>
  );

  return (
    <AppShell title={community.name} subtitle={community.description ?? "Structured community collaboration"} rightRail={rightRail}>
      <div className={`grid gap-6 ${community.isAdmin ? "xl:grid-cols-[300px_minmax(0,1fr)]" : ""}`}>
        {community.isAdmin ? (
          <aside className="space-y-6">
            <Card className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-text">Admin Panel</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-text">Pending Join Requests</h4>
                  {community.joinRequests?.filter((r) => r.status === "pending").length ? (
                    <div className="mt-3 space-y-3">
                      {community.joinRequests
                        .filter((r) => r.status === "pending")
                        .map((request) => (
                          <div key={request.userId._id} className="rounded-xl border border-border/70 bg-surfaceAlt p-3">
                            <p className="font-medium text-text">
                              {request.userId.fullName || request.userId.username}
                            </p>
                            <p className="text-xs text-textMuted">{request.userId.college}</p>
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                className="h-8 w-full text-xs"
                                onClick={() => reviewJoinRequest(request.userId._id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="secondary"
                                className="h-8 w-full text-xs"
                                onClick={() => reviewJoinRequest(request.userId._id, "reject")}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-textMuted">No pending requests.</p>
                  )}
                </div>

                <div className="border-t border-border/70 pt-4">
                  <h4 className="mb-3 font-semibold text-text">Create Community Event</h4>
                  <div className="space-y-3">
                    <FormInput label="Title" value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} />
                    <FormTextarea label="Description" value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} />
                    <FormInput label="Date and Time" type="datetime-local" value={eventForm.startsAt} onChange={(event) => setEventForm((current) => ({ ...current, startsAt: event.target.value }))} />
                    <FormInput label="Optional Link" value={eventForm.link} onChange={(event) => setEventForm((current) => ({ ...current, link: event.target.value }))} />
                    <Button className="mt-2 w-full" onClick={createEvent}>Create Event</Button>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        ) : null}
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
          <div className="bg-[linear-gradient(120deg,#153b77_0%,#1f5eff_42%,#0f8f7a_100%)] px-8 py-10 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">Verified Community</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-4xl font-bold tracking-tight">{community.name}</h2>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {community.type}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
              A premium, distraction-free collaboration space designed for sharper doubt solving, structured resource exchange, and verified academic networking.
            </p>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {community.isMember ? <Tag>Member</Tag> : null}
              {community.joinRequestPending ? <Tag>Join Request Pending</Tag> : null}
              {community.isAdmin ? <Tag>Verified Admin</Tag> : null}
            </div>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
          </div>

          {community.type === "college" && !community.isMember ? (
            <div className="grid gap-3 rounded-[22px] border border-border/70 bg-surfaceAlt p-5">
              <p className="text-sm leading-6 text-textMuted">
                This college community requires verification before access. Submit a secure proof link for review.
              </p>
              <FormInput
                label="ID card proof link"
                value={verificationUrl}
                onChange={(event) => setVerificationUrl(event.target.value)}
                placeholder="Paste a secure Drive link or uploaded document URL"
              />
              <Button variant="secondary" onClick={submitVerification}>
                Submit Verification
              </Button>
            </div>
          ) : null}
        </Card>

        <Tabs
          tabs={[
            { label: "Home", value: "home" },
            { label: "Posts", value: "posts" },
            { label: "Resources", value: "resources" },
            { label: "Events", value: "events" }
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === "home" ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="space-y-4">
              <h3 className="text-xl font-semibold text-text">Top Posts of the Community</h3>
              {data.home.topPosts.length ? (
                data.home.topPosts.map((post) => (
                  <Link key={post._id} href={`/posts/${post._id}`} className="block rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text">{post.title}</p>
                      <Tag>{post.postType}</Tag>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-textMuted">{post.content}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-textMuted">No posts yet.</p>
              )}
            </Card>
            <Card className="space-y-4">
              <h3 className="text-xl font-semibold text-text">Top Unanswered Questions</h3>
              {data.home.topUnansweredPosts.length ? (
                data.home.topUnansweredPosts.map((post) => (
                  <Link key={post._id} href={`/posts/${post._id}`} className="block rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                    <p className="font-semibold text-text">{post.title}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-textMuted">No unanswered questions.</p>
              )}
            </Card>
          </div>
        ) : null}

        {tab === "posts" ? (
          <div className="space-y-5">
            {community.isMember ? (
              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Create Post</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-text">Share a focused question or discussion</h3>
                  </div>
                </div>
                <select
                  className="rounded-2xl border border-border bg-surfaceAlt px-4 py-3 text-sm"
                  value={postForm.postType}
                  onChange={(event) =>
                    setPostForm((current) => ({
                      ...current,
                      postType: event.target.value as "question" | "discussion" | "resource"
                    }))
                  }
                >
                  <option value="question">Question</option>
                  <option value="discussion">Discussion</option>
                  <option value="resource">Resource</option>
                </select>
                <FormInput label="Title" value={postForm.title} onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))} />
                <FormTextarea label="Content" value={postForm.content} onChange={(event) => setPostForm((current) => ({ ...current, content: event.target.value }))} />
                {postForm.postType === "resource" ? (
                  <FormInput label="Resource Link" value={postForm.resourceUrl} onChange={(event) => setPostForm((current) => ({ ...current, resourceUrl: event.target.value }))} />
                ) : null}
                <FormInput label="Interest Tags" placeholder="DSA, Web Dev, Placements" value={postForm.tags} onChange={(event) => setPostForm((current) => ({ ...current, tags: event.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-textMuted">
                  <input type="checkbox" checked={postForm.isAnonymous} onChange={(event) => setPostForm((current) => ({ ...current, isAnonymous: event.target.checked }))} />
                  Post anonymously
                </label>
                <Button onClick={createPost}>Publish Post</Button>
              </Card>
            ) : null}

            {data.posts.length ? (
              data.posts.map((post) => (
                <Card key={post._id} className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/posts/${post._id}`} className="text-2xl font-bold tracking-tight text-text">
                      {post.title}
                    </Link>
                    <Tag>{post.postType}</Tag>
                  </div>
                  <p className="text-sm text-textMuted">
                    {post.isAnonymous
                      ? "Anonymous"
                      : `@${post.authorId?.username ?? "user"} • ${post.authorId?.status ?? "Member"}`}
                  </p>
                  <p className="text-base leading-7 text-textMuted">{post.content}</p>
                  {post.resourceUrl ? (
                    <a href={post.resourceUrl} target="_blank" className="text-sm font-semibold text-primary">
                      Open resource
                    </a>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-textMuted">
                    {post.score} upvotes • {post.repliesCount} replies
                  </p>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-textMuted">No posts created in this community yet.</p>
              </Card>
            )}
          </div>
        ) : null}

        {tab === "resources" ? (
          <div className="space-y-5">
            {community.isMember ? (
              <Card className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-text">Share a Resource</h3>
                <FormInput label="Title" value={resourceForm.title} onChange={(event) => setResourceForm((current) => ({ ...current, title: event.target.value }))} />
                <FormInput label="Link" value={resourceForm.url} onChange={(event) => setResourceForm((current) => ({ ...current, url: event.target.value }))} />
                <FormTextarea label="Description" value={resourceForm.description} onChange={(event) => setResourceForm((current) => ({ ...current, description: event.target.value }))} />
                <Button onClick={createResource}>Share Resource</Button>
              </Card>
            ) : null}
            {data.resources.length ? (
              data.resources.map((resource) => (
                <Card key={resource._id} className="space-y-3">
                  <a href={resource.url} target="_blank" className="text-xl font-semibold text-text">
                    {resource.title}
                  </a>
                  {resource.description ? <p className="text-sm leading-6 text-textMuted">{resource.description}</p> : null}
                  <a href={`/resources/${resource._id}`} className="text-sm font-semibold text-primary">
                    Discuss resource
                  </a>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-textMuted">No resources shared yet.</p>
              </Card>
            )}
          </div>
        ) : null}

        {tab === "events" ? (
          <div className="space-y-5">
            <Card className="space-y-4">
              <h3 className="text-xl font-semibold text-text">Upcoming Community Events</h3>
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <div key={event._id} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4">
                    <p className="font-semibold text-text">{event.title}</p>
                    <p className="mt-2 text-sm text-textMuted">{new Date(event.startsAt).toLocaleString()}</p>
                    {event.link ? (
                      <a href={event.link} target="_blank" className="mt-3 inline-block text-sm font-semibold text-primary">
                        Open event link
                      </a>
                    ) : null}
                    {community.isMember ? (
                      <Button variant="secondary" className="mt-4" onClick={() => joinEvent(event._id)}>
                        Join Event
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-textMuted">No upcoming events.</p>
              )}
            </Card>

            <Card className="space-y-4">
              <h3 className="text-xl font-semibold text-text">Past Events</h3>
              {pastEvents.length ? (
                pastEvents.map((event) => (
                  <div key={event._id} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4">
                    <p className="font-semibold text-text">{event.title}</p>
                    <p className="mt-2 text-sm text-textMuted">{new Date(event.startsAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-textMuted">No past events.</p>
              )}
            </Card>
          </div>
        ) : null}
        </div>
      </div>
    </AppShell>
  );
}
