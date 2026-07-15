"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Home,
  MoonStar,
  ShieldCheck,
  SunMedium,
  UsersRound
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { GlobalSearch } from "@/components/global-search";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function AppShell({
  title,
  subtitle,
  children,
  rightRail
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, appUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems: NavItem[] =
    appUser?.role === "superadmin"
      ? [
          { label: "Superadmin", href: "/superadmin", icon: ShieldCheck },
          { label: "Communities", href: "/superadmin#communities", icon: UsersRound },
          { label: "Stats", href: "/superadmin#stats", icon: CalendarDays }
        ]
      : appUser?.role === "college_admin"
        ? [
            { label: "Home", href: "/home", icon: Home },
            { label: "Admin", href: "/admin", icon: ShieldCheck },
            { label: "Communities", href: "/admin#communities", icon: UsersRound },
            { label: "Events", href: "/admin#events", icon: CalendarDays }
          ]
        : [
            { label: "Home", href: "/home", icon: Home },
            { label: "Communities", href: "/communities", icon: UsersRound },
            { label: "Events", href: "/events", icon: CalendarDays }
          ];

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (appUser?.role === "superadmin" && pathname !== "/superadmin") {
      router.replace("/superadmin");
      return;
    }



    if (appUser?.role === "college_admin_pending" && pathname !== "/admin-request") {
      router.replace("/admin-request");
      return;
    }

    if (appUser?.role === "user" && !appUser.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [appUser, loading, pathname, router, user]);

  if (loading || !user || (appUser?.role === "user" && !appUser.onboardingCompleted)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-textMuted">
        Loading Wisdom Wing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-4 xl:px-8">
          <Link
            href={
              appUser?.role === "superadmin"
                ? "/superadmin"
                : appUser?.role === "college_admin_pending"
                  ? "/admin-request"
                  : "/home"
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#153b77] via-primary to-accent text-sm font-bold text-white shadow-glow">
              WW
            </div>
            <div className="hidden md:block">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-textMuted">WISDOM WING</p>
              <p className="text-lg font-bold tracking-tight text-text">Professional Campus Collaboration</p>
            </div>
          </Link>

          <div className="flex-1">
            <GlobalSearch />
          </div>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-text transition hover:bg-surfaceAlt"
          >
            {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          </button>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-text transition hover:bg-surfaceAlt">
            <Bell className="h-4 w-4" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
          </button>

          {user ? (
            <div className="relative">
              <button
                aria-label="Open profile menu"
                onClick={() => setProfileMenuOpen((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#153b77] via-primary to-accent text-sm font-semibold text-white shadow-soft"
              >
                {(appUser?.fullName ?? user.displayName ?? user.email ?? "WW").slice(0, 2).toUpperCase()}
              </button>

              {profileMenuOpen ? (
                <div className="absolute right-0 top-14 z-40 w-56 rounded-[22px] border border-border bg-surface p-2 shadow-glow">
                  <button
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-textMuted hover:bg-surfaceAlt hover:text-text"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/dashboard");
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-textMuted hover:bg-surfaceAlt hover:text-text"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/dashboard#account-settings");
                    }}
                  >
                    Settings
                  </button>
                  {appUser?.role === "college_admin" ? (
                    <button
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-textMuted hover:bg-surfaceAlt hover:text-text"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push("/admin");
                      }}
                    >
                      Admin
                    </button>
                  ) : null}
                  {appUser?.role === "superadmin" ? (
                    <button
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-textMuted hover:bg-surfaceAlt hover:text-text"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push("/superadmin");
                      }}
                    >
                      Superadmin
                    </button>
                  ) : null}
                  <button
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-rose-500 hover:bg-rose-500/10"
                    onClick={async () => {
                      await logout();
                      router.push("/auth/login");
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="secondary">Log in</Button>
            </Link>
          )}
        </div>
      </header>

      <main
        className={`mx-auto grid max-w-[1440px] gap-8 px-5 py-8 xl:px-8 ${
          rightRail ? "xl:grid-cols-[84px_minmax(0,1fr)_320px]" : "xl:grid-cols-[84px_minmax(0,1fr)]"
        }`}
      >
        <aside className="hidden xl:block">
          <Card className="sticky top-28 flex items-center justify-center p-3">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href.split("#")[0]);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                      active
                        ? "border-primary/20 bg-primary text-white shadow-glow"
                        : "border-transparent bg-surfaceAlt text-textMuted hover:border-border hover:bg-white hover:text-text"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Wisdom Wing Workspace</p>
            <h1 className="text-4xl font-bold tracking-tight text-text">{title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-textMuted">{subtitle}</p>
          </div>
          {children}
        </section>

        {rightRail ? <aside className="space-y-5">{rightRail}</aside> : null}
      </main>
    </div>
  );
}
