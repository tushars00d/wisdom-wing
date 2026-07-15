"use client";

import Link from "next/link";
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { postService } from "@/lib/services";
import { CommunityPost } from "@/lib/types";

export function PostCard({
  post,
  onVote
}: {
  post: CommunityPost & { communityId?: { name?: string } };
  onVote?: (postId: string, score: number) => void;
}) {
  const authorLabel = post.isAnonymous
    ? "Anonymous"
    : `@${post.authorId?.username ?? "user"} • ${post.authorId?.status ?? "Member"}`;

  const vote = async (value: -1 | 0 | 1) => {
    const response = await postService.vote(post._id, value);
    onVote?.(post._id, response.score);
  };

  return (
    <Card className="space-y-5">
      <div className="flex gap-4">
        <div className="flex min-w-[56px] flex-col items-center rounded-[18px] border border-border/70 bg-surfaceAlt px-2 py-3">
          <button aria-label="Upvote" onClick={() => vote(1)} className="text-primary">
            <ArrowBigUp className="h-6 w-6" />
          </button>
          <span className="text-sm font-semibold text-text">{post.score}</span>
          <button aria-label="Downvote" onClick={() => vote(-1)} className="text-textMuted">
            <ArrowBigDown className="h-6 w-6" />
          </button>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textMuted">
              {post.communityId?.name ?? "Campus Feed"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/posts/${post._id}`} className="text-2xl font-bold tracking-tight text-text hover:text-primary">
                {post.title}
              </Link>
              <Tag>{post.postType}</Tag>
            </div>
            <p className="text-xs text-textMuted">{authorLabel}</p>
          </div>
          <p className="line-clamp-3 text-base leading-7 text-textMuted">{post.content}</p>
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
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-textMuted">
            <MessageSquare className="h-4 w-4" />
            {post.repliesCount} replies
          </div>
        </div>
      </div>
    </Card>
  );
}
