"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormTextarea } from "@/components/ui/form-input";
import { Tag } from "@/components/ui/tag";
import { apiFetch } from "@/lib/api";

type QuestionPayload = {
  question: {
    _id: string;
    title: string;
    body: string;
    tags: string[];
    answersCount: number;
    upvotes: number;
  };
  answers: Array<{
    _id: string;
    body: string;
    createdAt: string;
    source_type: "scraped" | "AI" | "user";
    source_url?: string;
    authorId?: {
      username?: string;
      fullName?: string;
      status?: string;
    } | null;
  }>;
};

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const [payload, setPayload] = useState<QuestionPayload | null>(null);
  const [answerBody, setAnswerBody] = useState("");

  const loadQuestion = () => {
    apiFetch<QuestionPayload>(`/api/questions/${params.id}`).then(setPayload);
  };

  useEffect(() => {
    loadQuestion();
  }, [params.id]);

  const submitAnswer = async () => {
    await apiFetch(`/api/questions/${params.id}/answers`, {
      method: "POST",
      body: JSON.stringify({ body: answerBody })
    });
    setAnswerBody("");
    loadQuestion();
  };

  return (
    <AppShell title="Question Detail" subtitle="Read the full question and future answers.">
      {!payload ? (
        <Card>Loading question...</Card>
      ) : (
        <>
          <Card className="space-y-4">
            <h2 className="text-2xl font-bold">{payload.question.title}</h2>
            <p className="leading-7 text-textMuted">{payload.question.body}</p>
            <div className="flex flex-wrap gap-2">
              {payload.question.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <p className="text-sm text-textMuted">
              {payload.question.upvotes} upvotes • {payload.question.answersCount} replies
            </p>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xl font-semibold">Post an Answer</h3>
            <FormTextarea
              label="Your answer"
              value={answerBody}
              onChange={(event) => setAnswerBody(event.target.value)}
              placeholder="Share a helpful answer for this question"
            />
            <Button onClick={submitAnswer}>Submit Answer</Button>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Answers</h3>
            {payload.answers.length ? (
              payload.answers.map((answer) => (
                <Card key={answer._id} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>
                      {answer.source_type === "user"
                        ? "User"
                        : answer.source_type === "scraped"
                          ? "Scraped"
                          : "AI Generated"}
                    </Tag>
                    <p className="text-xs text-textMuted">
                      {answer.authorId?.username
                        ? `@${answer.authorId.username} • ${answer.authorId.status ?? "Member"}`
                        : "Wisdom Wing Assistant"}
                    </p>
                  </div>
                  <p className="text-sm leading-7 text-textMuted">{answer.body}</p>
                  {answer.source_url ? (
                    <a href={answer.source_url} target="_blank" className="text-sm font-medium text-primary">
                      Open source
                    </a>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-textMuted">No answers yet. The auto-answer system will help if no one replies soon.</p>
              </Card>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
