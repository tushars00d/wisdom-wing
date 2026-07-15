import Link from "next/link";
import { ArrowRight, BookOpenText, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";

const features = [
  {
    icon: BookOpenText,
    title: "Ask Smart Questions",
    description: "College-specific Q&A with duplicate detection, AI summaries, and verified answers."
  },
  {
    icon: Users,
    title: "Find Your People",
    description: "Connect with seniors, peers, alumni, and project collaborators across your campus network."
  },
  {
    icon: GraduationCap,
    title: "Grow With Context",
    description: "Discover resources, events, and study groups that match your year, branch, and goals."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <span className="text-lg font-bold tracking-tight">Wisdom Wing</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button>Login/SignUp</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-border bg-surface px-4 py-1 text-sm text-textMuted">
            Built for students who want clarity, momentum, and community
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-text md:text-6xl">
              Elevate your campus journey without the social media noise.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-textMuted">
              Wisdom Wing helps college students ask doubts, find mentors, share resources, and grow
              through trusted communities built around real academic life.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/login">
              <Button className="px-6 py-3 text-base">
                Explore the Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden bg-surface p-0">
          <div className="bg-hero-grid p-6 dark:bg-hero-grid-dark">
            <div className="space-y-4 rounded-[18px] border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted">Campus Feed</p>
                  <h3 className="text-xl font-semibold">Trusted help, fast</h3>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Verified Network
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-aiBg p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    AI Quick Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-textMuted">
                    Similar DSA roadmaps already exist. Review them first, then post if your context is
                    unique.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm font-medium text-text">
                    Best resources for learning DSA as a first-year student?
                  </p>
                  <p className="mt-2 text-xs text-textMuted">Questions become searchable once students post them.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6">
        <SectionTitle
          eyebrow="Core Value"
          title="Designed for collaboration, not distraction"
          description="Every page is structured around useful action: ask, verify, connect, contribute, and grow."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="space-y-4">
                <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-textMuted">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
