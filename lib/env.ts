import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvironmentSchema = publicEnvironmentSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type EnvironmentStatus = {
  isConfigured: boolean;
  missingKeys: string[];
};

function getPublicEnvironmentInput() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function getServerEnvironmentInput() {
  return {
    ...getPublicEnvironmentInput(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getPublicEnvironmentStatus(): EnvironmentStatus {
  const result = publicEnvironmentSchema.safeParse(getPublicEnvironmentInput());

  if (result.success) {
    return {
      isConfigured: true,
      missingKeys: [],
    };
  }

  return {
    isConfigured: false,
    missingKeys: result.error.issues.map((issue) => issue.path.join(".")),
  };
}

export function getServerEnvironmentStatus(): EnvironmentStatus {
  const result = serverEnvironmentSchema.safeParse(getServerEnvironmentInput());

  if (result.success) {
    return {
      isConfigured: true,
      missingKeys: [],
    };
  }

  return {
    isConfigured: false,
    missingKeys: result.error.issues.map((issue) => issue.path.join(".")),
  };
}

export function getRequiredPublicEnvironment() {
  return publicEnvironmentSchema.parse(getPublicEnvironmentInput());
}

export function getRequiredServerEnvironment() {
  return serverEnvironmentSchema.parse(getServerEnvironmentInput());
}
