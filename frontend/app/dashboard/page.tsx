"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { StatTile } from "@/components/ui/stat-tile";
import { Tag } from "@/components/ui/tag";
import { interests } from "@/lib/options";
import { DashboardPayload, userService } from "@/lib/services";

export default function DashboardPage() {
  const { changePassword, refreshAppUser } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    college: "",
    status: "Student",
    interests: [] as string[]
  });

  useEffect(() => {
    userService.getDashboard().then((data) => {
      setDashboard(data);
      setProfile({
        fullName: data.user.fullName ?? "",
        username: data.user.username ?? "",
        college: data.user.college ?? "",
        status: data.user.status ?? "Student",
        interests: data.user.interests ?? []
      });
    });
  }, []);

  const saveProfile = async () => {
    const response = await userService.updateProfile(profile);
    await refreshAppUser();
    setDashboard((current) => (current ? { ...current, user: response.user } : current));
    setEditing(false);
  };

  const toggleInterest = (interest: string) => {
    setProfile((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest]
    }));
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle="A polished control center for your verified profile, collaboration footprint, academic activity, and saved knowledge."
    >
      {!dashboard ? (
        <Card>Loading dashboard...</Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatTile
              label="Verified College ID Status"
              value={dashboard.user.collegeIdVerification?.status === "approved" ? "Valid" : "Pending"}
              hint={dashboard.user.college ?? "Complete your profile to unlock trust signals."}
            />
            <StatTile
              label="My Engagement Score"
              value={String(dashboard.posts.length + dashboard.saved.posts.length + dashboard.events.length)}
              hint="Posts, saved items, and joined events combined."
            />
            <StatTile
              label="Mentorship Connections"
              value={String(Math.max(dashboard.communities.length * 2, 3))}
              hint="Derived from your active communities and collaboration footprint."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden p-0">
              <div className="bg-[linear-gradient(135deg,#153b77_0%,#1f5eff_48%,#0f8f7a_100%)] px-7 py-7 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">Digital Academic Identity</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">{dashboard.user.fullName}</h2>
                <p className="mt-2 text-sm text-white/80">
                  @{dashboard.user.username} • {dashboard.user.status} • {dashboard.user.college}
                </p>
              </div>
              <div className="space-y-5 p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm leading-7 text-textMuted">
                      A premium view of your growth footprint across questions, saved resources, events, and community engagement.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dashboard.user.interests.map((interest) => (
                        <Tag key={interest}>{interest}</Tag>
                      ))}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
                    {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {editing ? (
                  <div className="grid gap-4">
                    <FormInput label="Full Name" value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} />
                    <FormInput label="Username" value={profile.username} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))} />
                    <FormInput label="College" value={profile.college} onChange={(event) => setProfile((current) => ({ ...current, college: event.target.value }))} />
                    <FormInput label="Status" value={profile.status} onChange={(event) => setProfile((current) => ({ ...current, status: event.target.value }))} />
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={
                            profile.interests.includes(interest)
                              ? "rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white"
                              : "rounded-full border border-border bg-surfaceAlt px-3 py-2 text-xs font-semibold text-textMuted"
                          }
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    <Button onClick={saveProfile}>Save Changes</Button>
                  </div>
                ) : null}
              </div>
            </Card>

            <div className="space-y-6">
              <Card id="account-settings" className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Account Settings</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-text">Security & access</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <FormInput
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter a new password"
                  />
                  <Button
                    className="self-end"
                    onClick={async () => {
                      await changePassword(password);
                      setPassword("");
                      setMessage("Password updated.");
                    }}
                  >
                    Change Password
                  </Button>
                </div>
                {message ? <p className="text-sm text-success">{message}</p> : null}
              </Card>

              <Card className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Collaboration Hub</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4">
                    <p className="text-sm font-semibold text-text">Saved knowledge</p>
                    <p className="mt-2 text-3xl font-bold text-text">
                      {dashboard.saved.posts.length + dashboard.saved.questions.length + dashboard.saved.resources.length}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4">
                    <p className="text-sm font-semibold text-text">Joined communities</p>
                    <p className="mt-2 text-3xl font-bold text-text">{dashboard.communities.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text">My Posts</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Preview Grid</span>
              </div>
              <div className="grid gap-4">
                {dashboard.posts.length ? (
                  dashboard.posts.map((post) => (
                    <Link key={post._id} href={`/posts/${post._id}`} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-text">{post.title}</p>
                        <Tag>{post.postType}</Tag>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-textMuted">You have not created posts yet.</p>
                )}
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text">Bookmarks & Saved</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Knowledge Vault</span>
              </div>
              <div className="grid gap-4">
                {dashboard.saved.posts.length || dashboard.saved.questions.length || dashboard.saved.resources.length ? (
                  <>
                    {dashboard.saved.posts.map((post) => (
                      <Link key={post._id} href={`/posts/${post._id}`} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                        <p className="font-semibold text-text">{post.title}</p>
                      </Link>
                    ))}
                    {dashboard.saved.questions.map((question) => (
                      <Link key={question._id} href={`/questions/${question._id}`} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                        <p className="font-semibold text-text">{question.title}</p>
                      </Link>
                    ))}
                    {dashboard.saved.resources.map((resource) => (
                      <a key={resource._id} href={resource.url} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                        <p className="font-semibold text-text">{resource.title}</p>
                      </a>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-textMuted">Saved items will appear here.</p>
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="space-y-4">
              <h3 className="text-xl font-semibold text-text">My Communities</h3>
              {dashboard.communities.length ? (
                dashboard.communities.map((community) => (
                  <Link key={community._id} href={`/community/${community._id}`} className="block rounded-[20px] border border-border/70 bg-surfaceAlt p-4 transition hover:bg-white">
                    <p className="font-semibold text-text">{community.name}</p>
                    <p className="mt-1 text-sm text-textMuted">{community.college ?? "Open collaboration room"}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-textMuted">Join communities to build your collaboration graph.</p>
              )}
            </Card>

            <Card className="space-y-4">
              <h3 className="text-xl font-semibold text-text">My Events</h3>
              {dashboard.events.length ? (
                dashboard.events.map((event) => (
                  <div key={event._id} className="rounded-[20px] border border-border/70 bg-surfaceAlt p-4">
                    <p className="font-semibold text-text">{event.title}</p>
                    <p className="mt-1 text-sm text-textMuted">
                      {event.communityId?.name ?? "Community"} • {new Date(event.startsAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-textMuted">Joined events will appear here.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
