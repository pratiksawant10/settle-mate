"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  isAuthenticated: boolean;
};

function getMobileHref(href: string, isAuthenticated: boolean) {
  if (href === "/" && isAuthenticated) {
    return "/planner";
  }

  return href;
}

function getVisibleMobileNavItems(isAuthenticated: boolean) {
  return mobileNavItems.filter((item) => !isAuthenticated || item.href !== "/");
}

export function MobileBottomNav({ isAuthenticated }: MobileBottomNavProps) {
  const pathname = usePathname();
  const visibleItems = getVisibleMobileNavItems(isAuthenticated);

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 px-2 py-2 shadow-[0_-12px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur lg:hidden"
    >
      <div className={cn("grid gap-1", visibleItems.length === 5 ? "grid-cols-5" : "grid-cols-4")}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const href = getMobileHref(item.href, isAuthenticated);
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold text-muted-foreground",
                active && "bg-secondary text-secondary-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
