"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AskPage() {
  return (
    <AppShell
      title="Create a Post"
      subtitle="Posts are created inside communities so context and permissions stay clear."
    >
      <Card className="space-y-4">
        <p className="text-sm leading-6 text-textMuted">
          Open a community, join it, and use the Posts tab to create a typed post with tags and optional
          anonymous posting.
        </p>
        <Link href="/communities">
          <Button>Go to Communities</Button>
        </Link>
      </Card>
    </AppShell>
  );
}
