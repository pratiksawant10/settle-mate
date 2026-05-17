"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  className?: string;
  onLogout?: () => void;
  variant?: "ghost" | "outline" | "destructive";
};

export function LogoutButton({ className, onLogout, variant = "ghost" }: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    onLogout?.();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} className={className} disabled={pending} onClick={logout}>
      {pending ? "Logging out..." : "Logout"}
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
