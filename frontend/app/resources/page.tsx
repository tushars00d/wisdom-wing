"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResourcesPage() {
  return (
    <AppShell title="Resources" subtitle="Resources are organized inside each community.">
      <Card className="space-y-4">
        <p className="text-sm text-textMuted">
          Open a community and use the Resources tab to share links, notes, videos, or documents.
        </p>
        <Link href="/communities">
          <Button>Browse Communities</Button>
        </Link>
      </Card>
    </AppShell>
  );
}
