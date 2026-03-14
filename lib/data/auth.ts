import type { User } from "@supabase/supabase-js";

import {
  createSupabaseAdminClient,
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

function buildProfileFromUser(user: User): UserProfile {
  const timestamp = new Date().toISOString();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata.full_name as string | undefined) ?? "New User",
    created_at: timestamp,
    updated_at: timestamp,
  };
}

async function ensureUserProfile(user: User): Promise<UserProfile> {
  const fallbackProfile = buildProfileFromUser(user);

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("users")
      .upsert(
        {
          id: fallbackProfile.id,
          email: fallbackProfile.email,
          full_name: fallbackProfile.full_name,
        },
        {
          onConflict: "id",
        },
      )
      .select("*")
      .single();

    if (error || !data) {
      return fallbackProfile;
    }

    return data as UserProfile;
  } catch {
    return fallbackProfile;
  }
}

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
    .maybeSingle();

  if (profileError) {
    return {
      supabase,
      user,
      profile: buildProfileFromUser(user),
    };
  }

  return {
    supabase,
    user,
    profile: profile ?? (await ensureUserProfile(user)),
  };
}

export function requireConfiguredSupabase() {
  return isSupabaseConfigured();
}
