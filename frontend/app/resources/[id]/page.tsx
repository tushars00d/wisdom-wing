"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormTextarea } from "@/components/ui/form-input";
import { Reply, resourceService } from "@/lib/services";
import { CommunityResource } from "@/lib/types";

type ResourcePayload = {
  resource: CommunityResource & { score: number; repliesCount: number };
  replies: Reply[];
  userVote: number;
};

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const [payload, setPayload] = useState<ResourcePayload | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const loadResource = async () => {
    const response = await resourceService.get(params.id);
    setPayload(response);
  };

  useEffect(() => {
    loadResource();
  }, [params.id]);

  const vote = async (value: -1 | 0 | 1) => {
    if (!payload) return;
    const response = await resourceService.vote(payload.resource._id, value);
    setPayload({
      ...payload,
      userVote: response.userVote,
      resource: { ...payload.resource, score: response.score }
    });
  };

  const reply = async () => {
    if (!replyContent.trim()) return;
    await resourceService.reply(params.id, replyContent);
    setReplyContent("");
    await loadResource();
  };

  return (
    <AppShell title="Resource Detail" subtitle="Review, vote, and discuss a shared resource.">
      {!payload ? (
        <Card>Loading resource...</Card>
      ) : (
        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <button onClick={() => vote(payload.userVote === 1 ? 0 : 1)} className={payload.userVote === 1 ? "text-primary" : "text-textMuted"}>
                  <ArrowBigUp className="h-7 w-7" />
                </button>
                <span className="font-semibold">{payload.resource.score}</span>
                <button onClick={() => vote(payload.userVote === -1 ? 0 : -1)} className={payload.userVote === -1 ? "text-primary" : "text-textMuted"}>
                  <ArrowBigDown className="h-7 w-7" />
                </button>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{payload.resource.title}</h2>
                {payload.resource.description ? (
                  <p className="text-sm text-textMuted">{payload.resource.description}</p>
                ) : null}
                <a href={payload.resource.url} target="_blank" className="font-medium text-primary">
                  Open resource
                </a>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold">Replies</h3>
            <FormTextarea
              label="Add Reply"
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
            />
            <Button onClick={reply}>Reply</Button>
            {payload.replies.length ? (
              payload.replies.map((item) => (
                <div key={item._id} className="rounded-lg border border-border p-4">
                  <p className="text-xs text-textMuted">
                    @{item.authorId?.username ?? "user"} • {item.authorId?.status ?? "Member"} •{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-textMuted">{item.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-textMuted">No replies yet.</p>
            )}
          </Card>
        </div>
      )}
    </AppShell>
  );
}
