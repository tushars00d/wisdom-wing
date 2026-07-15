"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormTextarea } from "@/components/ui/form-input";
import { Tag } from "@/components/ui/tag";
import { postService, Reply } from "@/lib/services";
import { CommunityPost } from "@/lib/types";

type PostPayload = {
  post: CommunityPost & {
    communityId?: { name?: string };
  };
  replies: Reply[];
  userVote: number;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const [payload, setPayload] = useState<PostPayload | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const loadPost = async () => {
    const response = await postService.get(params.id);
    setPayload(response);
  };

  useEffect(() => {
    loadPost();
  }, [params.id]);

  const vote = async (value: -1 | 0 | 1) => {
    if (!payload) return;
    const response = await postService.vote(payload.post._id, value);
    setPayload({
      ...payload,
      userVote: response.userVote,
      post: { ...payload.post, score: response.score }
    });
  };

  const reply = async () => {
    if (!replyContent.trim()) return;
    await postService.reply(params.id, replyContent);
    setReplyContent("");
    await loadPost();
  };

  return (
    <AppShell title="Post Detail" subtitle="Read, vote, and reply.">
      {!payload ? (
        <Card>Loading post...</Card>
      ) : (
        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <button
                  aria-label="Upvote"
                  onClick={() => vote(payload.userVote === 1 ? 0 : 1)}
                  className={payload.userVote === 1 ? "text-primary" : "text-textMuted"}
                >
                  <ArrowBigUp className="h-7 w-7" />
                </button>
                <span className="font-semibold">{payload.post.score}</span>
                <button
                  aria-label="Downvote"
                  onClick={() => vote(payload.userVote === -1 ? 0 : -1)}
                  className={payload.userVote === -1 ? "text-primary" : "text-textMuted"}
                >
                  <ArrowBigDown className="h-7 w-7" />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">{payload.post.title}</h2>
                  <Tag>{payload.post.postType}</Tag>
                </div>
                <p className="text-sm text-textMuted">
                  {payload.post.isAnonymous
                    ? "Anonymous"
                    : `@${payload.post.authorId?.username ?? "user"} • ${payload.post.authorId?.status ?? "Member"}`}
                </p>
                <p className="leading-7 text-textMuted">{payload.post.content}</p>
                {payload.post.resourceUrl ? (
                  <a href={payload.post.resourceUrl} target="_blank" className="font-medium text-primary">
                    Open resource
                  </a>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {payload.post.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold">Replies</h3>
            <FormTextarea
              label="Add Reply"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              placeholder="Write a helpful reply..."
            />
            <Button onClick={reply}>Reply</Button>

            <div className="space-y-3">
              {payload.replies.length ? (
                payload.replies.map((item) => (
                  <div key={item._id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.source_type && item.source_type !== "user" ? (
                        <Tag>{item.source_type === "scraped" ? "Scraped" : "AI Generated"}</Tag>
                      ) : null}
                      <p className="text-xs text-textMuted">
                        {item.authorId?.username
                          ? `@${item.authorId.username} • ${item.authorId.status ?? "Member"}`
                          : "Wisdom Wing Assistant"}{" "}
                        • {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-textMuted">{item.content}</p>
                    {item.source_url ? (
                      <a href={item.source_url} target="_blank" className="mt-2 inline-block text-sm font-medium text-primary">
                        Open source
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-textMuted">No replies yet.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
