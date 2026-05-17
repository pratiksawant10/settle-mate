"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/logout-button";
import { PlanCtaLink } from "@/components/plan-cta-link";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  isAuthenticated: boolean;
};

function getNavHref(href: string, isAuthenticated: boolean) {
  if (href === "/" && isAuthenticated) {
    return "/planner";
  }

  return href;
}

function getVisibleNavItems(isAuthenticated: boolean) {
  return navItems.filter((item) => {
    if (isAuthenticated) {
      return item.href !== "/";
    }

    return item.href !== "/planner";
  });
}

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleNavItems = getVisibleNavItems(isAuthenticated);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>SettleMate AI</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {visibleNavItems.map((item) => {
            const href = getNavHref(item.href, isAuthenticated);
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-secondary text-secondary-foreground shadow-sm",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/account">
                  Account Settings
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button asChild size="sm" variant="accent">
              <PlanCtaLink icon="none" />
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t bg-white lg:hidden">
          <nav aria-label="Mobile navigation" className="container grid gap-1 py-3">
            {visibleNavItems.map((item) => {
              const href = getNavHref(item.href, isAuthenticated);
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm font-medium text-muted-foreground",
                    active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className={cn(
                    "rounded-md px-3 py-3 text-sm font-medium text-muted-foreground",
                    pathname === "/account"
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  Account Settings
                </Link>
                <LogoutButton
                  variant="outline"
                  className="mt-2 justify-start px-3"
                  onLogout={() => setOpen(false)}
                />
              </>
            ) : (
              <Button asChild variant="accent" className="mt-2 justify-start">
                <PlanCtaLink icon="none" onClick={() => setOpen(false)} />
              </Button>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
