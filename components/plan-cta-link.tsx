"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type PlanCtaLinkProps = {
  defaultLabel?: string;
  profileLabel?: string;
  icon?: "arrow" | "sparkles" | "none";
  className?: string;
  onClick?: () => void;
};

export const PlanCtaLink = forwardRef<HTMLAnchorElement, PlanCtaLinkProps>(
  (
    {
      defaultLabel = "Build My Plan",
      profileLabel = "Open Planner",
      icon = "arrow",
      className,
      onClick,
    },
    ref,
  ) => {
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
      let active = true;

      async function loadProfileState() {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!active || !user) {
            return;
          }

          const { data, error } = await supabase
            .from("student_onboarding_profiles")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (active) {
            setHasProfile(!error && Boolean(data));
          }
        } catch {
          if (active) {
            setHasProfile(false);
          }
        }
      }

      loadProfileState();
      window.addEventListener("student-plan-updated", loadProfileState);

      return () => {
        active = false;
        window.removeEventListener("student-plan-updated", loadProfileState);
      };
    }, []);

    const Icon = icon === "arrow" ? ArrowRight : icon === "sparkles" ? Sparkles : null;

    return (
      <Link
        ref={ref}
        href={hasProfile ? "/planner" : "/login?next=/planner"}
        className={cn(className)}
        onClick={onClick}
      >
        {hasProfile ? profileLabel : defaultLabel}
        {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      </Link>
    );
  },
);

PlanCtaLink.displayName = "PlanCtaLink";
