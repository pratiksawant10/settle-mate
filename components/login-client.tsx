"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type LoginClientProps = {
  nextPath: string;
  authError?: string;
};

export function LoginClient({ nextPath, authError }: LoginClientProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (signInError) {
      setPending(false);
      setError(signInError.message);
    }
  }

  const message =
    error ??
    (authError === "auth-code" ? "We could not complete Google sign in. Please try again." : null);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] items-center bg-slate-50 py-10">
      <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-primary">Student plan access</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Sign in to build your student plan
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Use Google to continue to onboarding, then turn your arrival details into a first-90-days dashboard.
          </p>
        </div>

        <section className="rounded-lg border bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b pb-5">
            <div>
              <p className="text-sm font-semibold text-primary">Login or signup</p>
              <h2 className="mt-1 text-2xl font-bold">Continue with Google</h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border bg-slate-50 text-lg font-bold text-primary">
              G
            </span>
          </div>

          <Button
            type="button"
            size="lg"
            variant="outline"
            className="mt-6 w-full justify-center border-slate-300 bg-white text-foreground hover:bg-slate-50"
            disabled={pending}
            onClick={signInWithGoogle}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-sm border text-sm font-bold text-primary">
              G
            </span>
            {pending ? "Redirecting..." : "Sign in with Google"}
          </Button>

          {message ? (
            <div className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{message}</p>
            </div>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            After Google confirms your account, SettleMate will return you to student onboarding.
          </p>
        </section>
      </div>
    </div>
  );
}
