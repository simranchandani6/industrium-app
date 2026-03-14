import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const raw = readFileSync(envPath, "utf-8");

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found; rely on environment variables.
  }
}

loadEnvLocal();

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

const demoUserId = "aaaaaaaa-1111-4111-8111-111111111111";
const demoEmail = "simra.chandani@bacancy.com";
const demoPassword = "DemoPass123!";
const demoFullName = "Simran Chandani";

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const authAdminHeaders = {
  Authorization: `Bearer ${serviceRoleKey}`,
  apikey: serviceRoleKey,
  "Content-Type": "application/json",
} satisfies HeadersInit;

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const publicClient = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function provisionDemoAuthUser() {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: demoEmail,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      full_name: demoFullName,
    },
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    role: "authenticated",
  });

  if (error || !data.user) {
    const message = error?.message ?? "unknown error";

    if (/Database error checking email|Database error creating new user|unexpected_failure|already been registered|already registered/i.test(message)) {
      throw new Error(
        "Run supabase/repair_demo_auth.sql in the SQL editor first, then rerun npm run seed:demo-auth.",
      );
    }

    throw new Error(`Unable to create demo auth user: ${message}`);
  }

  return data.user;
}

async function migrateUserReferences(
  fromUserId: string,
  toUserId: string,
) {
  if (fromUserId === toUserId) {
    return;
  }

  const directOwnershipTables = [
    "products",
    "suppliers",
    "documents",
    "change_requests",
    "quality_issues",
    "projects",
    "compliance_records",
    "product_risks",
    "customer_feedback",
    "notifications",
  ] as const;

  for (const table of directOwnershipTables) {
    const { error } = await adminClient
      .from(table)
      .update({ user_id: toUserId })
      .eq("user_id", fromUserId);

    if (error) {
      throw new Error(`Unable to migrate ${table}.user_id: ${error.message}`);
    }
  }

  const attributionUpdates: Array<{ table: string; column: string }> = [
    { table: "product_versions", column: "created_by" },
    { table: "documents", column: "uploaded_by" },
    { table: "change_requests", column: "requested_by" },
    { table: "approvals", column: "approver_id" },
    { table: "quality_issues", column: "reported_by" },
  ];

  for (const update of attributionUpdates) {
    const { error } = await adminClient
      .from(update.table)
      .update({ [update.column]: toUserId })
      .eq(update.column, fromUserId);

    if (error) {
      throw new Error(`Unable to migrate ${update.table}.${update.column}: ${error.message}`);
    }
  }
}

async function upsertPublicProfile(userId: string) {
  const { error } = await adminClient.from("users").upsert(
    {
      id: userId,
      email: demoEmail,
      full_name: demoFullName,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    throw new Error(`Unable to upsert demo public profile: ${error.message}`);
  }
}

async function verifyLogin() {
  const { data, error } = await publicClient.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error || !data.user) {
    throw new Error(`Demo login failed after provisioning: ${error?.message ?? "unknown error"}`);
  }

  await publicClient.auth.signOut();
}

async function main() {
  const user = await provisionDemoAuthUser();

  await migrateUserReferences(demoUserId, user.id);
  await upsertPublicProfile(user.id);
  await verifyLogin();

  console.log(`Demo auth user created and verified: ${demoEmail} (${user.id})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
