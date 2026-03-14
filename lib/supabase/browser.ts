import { createBrowserClient } from "@supabase/ssr";

import { getRequiredPublicEnvironment } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export function createSupabaseBrowserClient() {
  const environment = getRequiredPublicEnvironment();

  return createBrowserClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

