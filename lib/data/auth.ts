import type { User } from "@supabase/supabase-js";

import { readDemoSessionCookie } from "@/lib/demo-auth";
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

function buildDemoUser(profile: UserProfile): User {
  const timestamp = new Date().toISOString();

  return {
    id: profile.id,
    app_metadata: {
      provider: "demo",
      providers: ["demo"],
    },
    user_metadata: {
      full_name: profile.full_name,
    },
    aud: "authenticated",
    confirmation_sent_at: timestamp,
    confirmed_at: timestamp,
    created_at: profile.created_at,
    email: profile.email,
    email_confirmed_at: timestamp,
    factors: [],
    identities: [],
    is_anonymous: false,
    last_sign_in_at: timestamp,
    phone: "",
    role: "authenticated",
    updated_at: profile.updated_at,
  } as User;
}

async function getDemoSessionContext(): Promise<SessionContext | null> {
  const demoSession = await readDemoSessionCookie();

  if (!demoSession) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("users")
    .select("*")
    .eq("id", demoSession.userId)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }

  return {
    supabase: admin as unknown as SupabaseServerClient,
    user: buildDemoUser(profile as UserProfile),
    profile: profile as UserProfile,
  };
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
    return getDemoSessionContext();
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
