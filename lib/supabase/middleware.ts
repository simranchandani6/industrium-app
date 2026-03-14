import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { getPublicEnvironmentStatus, getRequiredPublicEnvironment } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export async function updateSession(request: NextRequest) {
  if (!getPublicEnvironmentStatus().isConfigured) {
    return NextResponse.next({
      request,
    });
  }

  const environment = getRequiredPublicEnvironment();
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}
