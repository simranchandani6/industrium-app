"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="size-4" />
        {isPending ? "Signing out..." : "Sign out"}
      </button>
      {errorMessage ? <p className="text-xs text-signal">{errorMessage}</p> : null}
    </div>
  );
}

