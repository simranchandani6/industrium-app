import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import {
  getPublicEnvironmentStatus,
  getRequiredPublicEnvironment,
  getRequiredServerEnvironment,
} from "@/lib/env";
import type { Database } from "@/lib/types/database";

export async function createSupabaseServerClient() {
  const environment = getRequiredPublicEnvironment();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components can read cookies during render but cannot always set them.
          }
        },
      },
    },
  );
}

export function createSupabaseAdminClient() {
  const environment = getRequiredServerEnvironment();

  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export function isSupabaseConfigured() {
  return getPublicEnvironmentStatus().isConfigured;
}

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
