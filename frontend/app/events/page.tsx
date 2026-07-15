"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { Tabs } from "@/components/ui/tabs";
import { eventService } from "@/lib/services";
import { CommunityEvent } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [filter, setFilter] = useState<"all" | "community" | "personal">("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    link: ""
  });

  const loadEvents = async () => {
    const payload = await eventService.listForMe();
    setEvents(payload.events);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((event) => event.type === filter);
  }, [events, filter]);

  const communityEvents = filteredEvents.filter((event) => event.type === "community");
  const personalEvents = filteredEvents.filter((event) => event.type === "personal");

  const createPersonalEvent = async () => {
    await eventService.create({
      type: "personal",
      title: form.title,
      description: form.description,
      startsAt: form.startsAt,
      link: form.link
    });
    setForm({ title: "", description: "", startsAt: "", link: "" });
    await loadEvents();
  };

  const deleteEvent = async (eventId: string) => {
    await eventService.remove(eventId);
    await loadEvents();
  };

  const reminderLabel = (dateString: string) => {
    const days = Math.max(0, Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    return `${days} Day${days === 1 ? "" : "s"} Reminder`;
  };

  const renderEventCard = (event: CommunityEvent, compact = false) => (
    <Card key={event._id} className={compact ? "space-y-2 bg-surfaceAlt shadow-none" : "space-y-3"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {event.type === "community" ? "Community Event" : "Personal Event"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-text">{event.title}</h3>
          <p className="text-sm text-textMuted">{new Date(event.startsAt).toLocaleString()}</p>
        </div>
        {event.type === "personal" ? (
          <Button variant="secondary" onClick={() => deleteEvent(event._id)}>
            Delete
          </Button>
        ) : null}
      </div>
      <p className="text-sm leading-6 text-textMuted">{event.description}</p>
      {typeof event.communityId === "object" && event.communityId?.name ? (
        <p className="text-sm text-textMuted">Community: {event.communityId.name}</p>
      ) : null}
      {event.link ? (
        <a href={event.link} target="_blank" className="text-sm font-semibold text-primary">
          Open event link
        </a>
      ) : null}
    </Card>
  );

  return (
    <AppShell
      title="Events"
      subtitle="A premium event workspace for saved reminders, community sessions, and personal planning without distractions."
    >
      <div className="space-y-6">
        <Card className="overflow-hidden p-0">
          <div className="bg-[linear-gradient(120deg,#153b77_0%,#1f5eff_42%,#0f8f7a_100%)] px-8 py-10 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">Featured Event Banner</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">Annual Hackathon - Spring 2026</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82">
              A polished shared calendar experience for hackathons, study circles, placement briefings, and personal milestones across your academic network.
            </p>
          </div>
        </Card>

        <Tabs
          tabs={[
            { label: "All", value: "all" },
            { label: "Community", value: "community" },
            { label: "Personal", value: "personal" }
          ]}
          value={filter}
          onChange={(value) => setFilter(value as "all" | "community" | "personal")}
        />

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Saved Event Reminders</p>
            {(filter === "all" || filter === "personal" ? personalEvents : filteredEvents).slice(0, 6).map((event) => (
              <Card key={`reminder-${event._id}`} className="bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_100%)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {reminderLabel(event.startsAt)}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-text">{event.title}</h3>
                <p className="mt-2 text-sm text-textMuted">{new Date(event.startsAt).toLocaleString()}</p>
              </Card>
            ))}
            {!events.length ? (
              <Card>
                <p className="text-sm text-textMuted">No saved events yet.</p>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Upcoming Community Events</p>
            {(filter === "all" || filter === "community" ? communityEvents : []).length ? (
              (filter === "all" || filter === "community" ? communityEvents : []).map((event) => renderEventCard(event))
            ) : filter !== "personal" ? (
              <Card>
                <p className="text-sm text-textMuted">No community events scheduled right now.</p>
              </Card>
            ) : null}

            {filter === "personal" && personalEvents.length ? (
              personalEvents.map((event) => renderEventCard(event))
            ) : null}
          </div>

          <Card className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Create Personal Event</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-text">Plan your own milestones</h3>
            </div>
            <FormInput label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <FormTextarea label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <FormInput label="Date and Time" type="datetime-local" value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} />
            <FormInput label="Optional Link" value={form.link} onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))} />
            <Button className="w-full" onClick={createPersonalEvent}>
              Create Personal Event
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
