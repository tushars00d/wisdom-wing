"use client";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function MessagesPage() {
  return (
    <AppShell title="Messages" subtitle="Messaging is reserved for the next product phase.">
      <Card>
        <p className="text-sm text-textMuted">
          Direct messaging is not enabled yet. Community QnA, resources, and events are available now.
        </p>
      </Card>
    </AppShell>
  );
}
