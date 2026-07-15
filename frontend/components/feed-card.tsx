import { ArrowBigUp, BadgeCheck, MessageSquare } from "lucide-react";
import { FeedPost } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

export function FeedCard({ post }: { post: FeedPost }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <span className="font-semibold text-text">{post.author}</span>
            {post.verified ? <BadgeCheck className="h-4 w-4 text-success" /> : null}
            <span>{post.role}</span>
            <span>{post.timestamp}</span>
          </div>
          <p className="text-xs text-textMuted">{post.college}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{post.title}</h3>
        <p className="text-sm leading-6 text-textMuted">{post.snippet}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className="flex items-center gap-5 text-sm text-textMuted">
        <span className="inline-flex items-center gap-1">
          <ArrowBigUp className="h-4 w-4 text-primary" />
          {post.votes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {post.comments}
        </span>
      </div>
    </Card>
  );
}
