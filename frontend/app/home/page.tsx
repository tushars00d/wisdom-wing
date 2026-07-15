"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { Card } from "@/components/ui/card";
import { eventService, feedService, HomeFeedPayload } from "@/lib/services";
import { CommunityEvent } from "@/lib/types";

export default function HomePage() {
  const [feed, setFeed] = useState<HomeFeedPayload | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);

  useEffect(() => {
    feedService.home().then(setFeed);
    eventService.listForMe().then((payload) => setEvents(payload.events.slice(0, 6)));
  }, []);

  const updateScore = (postId: string, score: number) => {
    setFeed((current) =>
      current
        ? {
            ...current,
            posts: current.posts.map((post) => (post._id === postId ? { ...post, score } : post))
          }
        : current
    );
  };

  return (
    <AppShell
      title="Home"
      subtitle="A clean, high-signal workspace for student collaboration, verified guidance, and focused community learning."
      rightRail={
        <>
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Top 8 Unanswered Questions</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Focus Queue</span>
            </div>
            {!feed ? <p className="text-sm text-textMuted">Loading...</p> : null}
            {feed?.topUnansweredPosts.length ? (
              feed.topUnansweredPosts.slice(0, 8).map((post, index) => (
                <Link
                  key={post._id}
                  href={`/posts/${post._id}`}
                  className="block rounded-[20px] border border-border/70 bg-surfaceAlt px-4 py-4 transition hover:border-primary/20 hover:bg-white"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textMuted">
                    #{String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-text">{post.title}</p>
                </Link>
              ))
            ) : feed ? (
              <p className="text-sm text-textMuted">No unanswered questions found.</p>
            ) : null}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Upcoming Events Timeline</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Saved Reminders</span>
            </div>
            {events.length ? (
              <div className="space-y-4">
                {events.map((event) => {
                  const days = Math.max(
                    0,
                    Math.ceil((new Date(event.startsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  );
                  return (
                    <div key={event._id} className="rounded-[20px] border border-border/70 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                        {days} Day{days === 1 ? "" : "s"} to go
                      </p>
                      <p className="mt-2 text-sm font-semibold text-text">{event.title}</p>
                      <p className="mt-1 text-sm text-textMuted">
                        {typeof event.communityId === "object" && event.communityId?.name
                          ? event.communityId.name
                          : "Personal planning"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-textMuted">Saved events with reminders will appear here.</p>
            )}
          </Card>
        </>
      }
    >
      <div className="space-y-5">
        <Card className="bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_55%,#eef7ff_100%)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Curated Feed</p>
              <h2 className="text-2xl font-bold tracking-tight text-text">Campus conversations worth your attention</h2>
              <p className="max-w-2xl text-sm leading-7 text-textMuted">
                Your feed is tuned for academic relevance, genuine collaboration, and faster access to verified peer knowledge.
              </p>
            </div>
            <div className="rounded-[22px] border border-border/70 bg-white px-5 py-4 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Live Signal</p>
              <p className="mt-2 text-3xl font-bold text-text">{feed?.posts.length ?? 0}</p>
              <p className="text-sm text-textMuted">Active feed items right now</p>
            </div>
          </div>
        </Card>

        {!feed ? <Card>Loading personalized feed...</Card> : null}
        {feed?.posts.length ? (
          feed.posts.map((post) => <PostCard key={post._id} post={post} onVote={updateScore} />)
        ) : feed ? (
          <Card>
            <p className="text-sm text-textMuted">
              Join communities and select interests during onboarding to personalize your home feed.
            </p>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
