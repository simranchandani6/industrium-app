import type { User } from "@supabase/supabase-js";

import {
  isSupabaseConfigured,
  createSupabaseServerClient,
  type SupabaseServerClient,
} from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types/plm";

export type SessionContext = {
  supabase: SupabaseServerClient;
  user: User;
  profile: UserProfile;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    supabase,
    user,
    profile,
  };
}

export function requireConfiguredSupabase() {
  return isSupabaseConfigured();
}
