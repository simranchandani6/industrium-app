import type { User } from "@supabase/supabase-js";

import { readDemoSessionCookie } from "@/lib/demo-auth";
import {
  dashboardFocusByRole,
  demoAccounts,
  getDemoAccountByEmail,
  hasCapability,
  resolveUserRole,
  resolveWorkspaceOwnerId,
  roleLabels,
  type RoleCapability,
} from "@/lib/rbac";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
  createSupabaseServerClient,
  type SupabaseServerClient,
} from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types/plm";
import type { UserRole } from "@/lib/types/database";

export type SessionContext = {
  supabase: SupabaseServerClient;
  user: User;
  profile: UserProfile;
  role: UserRole;
  roleLabel: string;
  workspaceOwnerId: string;
  dashboardFocus: (typeof dashboardFocusByRole)[UserRole];
};

function buildProfileFromUser(user: User): UserProfile {
  const timestamp = new Date().toISOString();
  const role = resolveUserRole({
    email: user.email,
    role: typeof user.user_metadata.role === "string" ? user.user_metadata.role : null,
  });

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata.full_name as string | undefined) ?? "New User",
    role,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

async function upsertUserProfile(profile: UserProfile): Promise<UserProfile> {
  const admin = createSupabaseAdminClient();
  const basePayload = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
  };

  const withRoleAttempt = await admin
    .from("users")
    .upsert(
      {
        ...basePayload,
        role: profile.role,
      },
      {
        onConflict: "id",
      },
    )
    .select("*")
    .maybeSingle();

  if (!withRoleAttempt.error && withRoleAttempt.data) {
    const row = withRoleAttempt.data as Partial<UserProfile>;
    return {
      ...profile,
      ...row,
      role: resolveUserRole({ email: row.email ?? profile.email, role: row.role ?? profile.role }),
    };
  }

  const withoutRoleAttempt = await admin
    .from("users")
    .upsert(basePayload, {
      onConflict: "id",
    })
    .select("*")
    .maybeSingle();

  if (!withoutRoleAttempt.error && withoutRoleAttempt.data) {
    const row = withoutRoleAttempt.data as Partial<UserProfile>;
    return {
      ...profile,
      ...row,
      role: resolveUserRole({ email: row.email ?? profile.email, role: row.role ?? profile.role }),
    };
  }

  return profile;
}

async function ensureUserProfile(user: User): Promise<UserProfile> {
  const fallbackProfile = buildProfileFromUser(user);

  try {
    return await upsertUserProfile(fallbackProfile);
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
      role: profile.role,
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

function enrichSessionContext(
  supabase: SupabaseServerClient,
  user: User,
  profile: UserProfile,
): SessionContext {
  const role = resolveUserRole({ email: profile.email, role: profile.role });
  const workspaceOwnerId = resolveWorkspaceOwnerId({
    id: profile.id,
    email: profile.email,
    role,
  });

  return {
    supabase,
    user,
    profile: {
      ...profile,
      role,
    },
    role,
    roleLabel: roleLabels[role],
    workspaceOwnerId,
    dashboardFocus: dashboardFocusByRole[role],
  };
}

async function getDemoSessionContext(): Promise<SessionContext | null> {
  const demoSession = await readDemoSessionCookie();

  if (!demoSession) {
    return null;
  }

  const seededAccount = demoAccounts.find((account) => account.id === demoSession.userId);
  if (!seededAccount) {
    return null;
  }

  const fallbackProfile: UserProfile = {
    id: seededAccount.id,
    email: seededAccount.email,
    full_name: seededAccount.fullName,
    role: seededAccount.role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const profile = await upsertUserProfile(fallbackProfile);
    const admin = createSupabaseAdminClient();
    return enrichSessionContext(admin as unknown as SupabaseServerClient, buildDemoUser(profile), profile);
  } catch {
    const admin = createSupabaseAdminClient();
    return enrichSessionContext(
      admin as unknown as SupabaseServerClient,
      buildDemoUser(fallbackProfile),
      fallbackProfile,
    );
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
    return getDemoSessionContext();
  }

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileError
    ? buildProfileFromUser(user)
    : ((profileData as Partial<UserProfile> | null) ?? (await ensureUserProfile(user)));

  const normalizedProfile: UserProfile = {
    ...buildProfileFromUser(user),
    ...profile,
    role: resolveUserRole({ email: profile.email ?? user.email, role: profile.role }),
  };

  const seededAccount = getDemoAccountByEmail(normalizedProfile.email);

  if (seededAccount) {
    const admin = createSupabaseAdminClient();
    const ensuredProfile = await upsertUserProfile({
      ...normalizedProfile,
      id: seededAccount.id,
      email: seededAccount.email,
      full_name: seededAccount.fullName,
      role: seededAccount.role,
    });

    return enrichSessionContext(
      admin as unknown as SupabaseServerClient,
      buildDemoUser(ensuredProfile),
      ensuredProfile,
    );
  }

  return enrichSessionContext(supabase, user, normalizedProfile);
}

export function requireConfiguredSupabase() {
  return isSupabaseConfigured();
}

export function canManage(sessionContext: SessionContext, capability: RoleCapability) {
  return hasCapability(sessionContext.role, capability);
}
