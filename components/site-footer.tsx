import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { navItems } from "@/lib/constants";

const productLinks = navItems.filter((item) => item.href !== "/" && item.href !== "/ask-ai");
const supportLinks = navItems.filter((item) => item.href === "/ask-ai");

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            SettleMate AI
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Helping international students in Australia plan their budgets and find affordable housing
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Product</h2>
          <div className="mt-4 grid gap-2">
            {productLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Support</h2>
          <div className="mt-4 grid gap-2">
            {supportLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-5 text-xs leading-5 text-muted-foreground">
          SettleMate AI provides general information only. It is not legal, financial, migration,
          employment, or housing advice.
        </div>
      </div>
    </footer>
  );
}
