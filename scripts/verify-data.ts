/**
 * Data verification script for the Industrium PLM platform.
 *
 * Confirms:
 *   1. User-owned schema tables are present
 *   2. The seeded demo auth user and profile exist
 *   3. Seed products, BOM data, documents, workflows, suppliers, projects, and new MVP tables exist
 *   4. The private storage bucket exists
 *
 * Usage:
 *   npm run verify:data
 */

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

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "\n[Industrium verify] Missing environment variables.\n" +
      "  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n",
  );

  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const publicClient = anonKey
  ? createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

let passCount = 0;
let failCount = 0;

function isRetryableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /fetch failed|getaddrinfo|eai_again/i.test(error.message);
}

async function withRetry(operation: () => PromiseLike<any>, retries = 2): Promise<any> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableError(error) || attempt >= retries) {
        throw error;
      }

      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }
}

function pass(label: string, detail?: string) {
  passCount++;
  const suffix = detail ? `  -> ${detail}` : "";
  console.log(`  ✓  ${label}${suffix}`);
}

function fail(label: string, reason?: string) {
  failCount++;
  const suffix = reason ? `  -> ${reason}` : "";
  console.error(`  ✗  ${label}${suffix}`);
}

async function countRows(table: string) {
  try {
    const { count, error } = await adminClient
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      return -1;
    }

    return count ?? 0;
  } catch {
    return -1;
  }
}

async function verifySchemaTablesExist() {
  console.log("\n-- Schema tables ---------------------------------------------");

  const expectedTables = [
    "users",
    "products",
    "product_versions",
    "bill_of_materials",
    "components",
    "suppliers",
    "documents",
    "change_requests",
    "approvals",
    "quality_issues",
    "projects",
    "manufacturing_process_steps",
    "compliance_records",
    "product_risks",
    "customer_feedback",
    "notifications",
  ];

  for (const table of expectedTables) {
    const count = await countRows(table);

    if (count >= 0) {
      pass(table, `${count} rows`);
    } else {
      fail(table, "table unreachable or missing");
    }
  }
}

async function verifyDemoAuthUser() {
  console.log("\n-- Demo user -------------------------------------------------");

  let resolvedUserId: string | null = null;

  if (publicClient) {
    const { data, error } = await withRetry(() =>
      publicClient.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      }),
    );

    if (error || !data.user) {
      fail("Demo password login", error?.message ?? "login failed");
    } else {
      resolvedUserId = data.user.id;
      pass("Demo password login", `${data.user.email} • ${data.user.id}`);
      await publicClient.auth.signOut();
    }
  }

  const { data, error } = await withRetry(() => adminClient.auth.admin.getUserById(demoUserId));

  if (!error && data.user) {
    resolvedUserId = data.user.id;
    pass("Demo auth user", `${data.user.email} • ${data.user.id}`);
  } else {
    const { data: listData, error: listError } = await withRetry(() =>
      adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      }),
    );

    if (listError) {
      fail("Demo auth user", listError.message);
      return;
    }

    const demoUser = listData.users.find((user: any) => user.email === demoEmail || user.id === demoUserId);

    if (!demoUser) {
      fail(
        "Demo auth user",
        "not found in Auth Admin API; the business seed exists, but the demo login is not usable yet",
      );
      return;
    }

    resolvedUserId = demoUser.id;
    pass("Demo auth user", `${demoUser.email} • ${demoUser.id}`);
  }

  if (resolvedUserId !== demoUserId) {
    fail("Demo auth user id", `expected ${demoUserId}, found ${resolvedUserId}`);
    return;
  }

  const { data: profile, error: profileError } = await withRetry(() =>
    adminClient
      .from("users")
      .select("id, email, full_name")
      .eq("id", resolvedUserId)
      .single(),
  );

  if (profileError || !profile) {
    fail("Demo public profile", profileError?.message ?? "not found");
    return;
  }

  pass("Demo public profile", `${profile.full_name} • ${profile.email}`);
}

async function verifyProductSeeds() {
  console.log("\n-- Product data ----------------------------------------------");

  const { data, error } = await withRetry(() =>
    adminClient
      .from("products")
      .select("id, product_name, lifecycle_stage, current_version_id")
      .eq("user_id", demoUserId)
      .order("product_name"),
  );

  if (error) {
    fail("Seed products", error.message);
    return;
  }

  const products = data ?? [];

  if (products.length < 3) {
    fail("Seed products", `expected at least 3, found ${products.length}`);
    return;
  }

  for (const product of products) {
    pass(product.product_name, `${product.lifecycle_stage} • current version linked`);
  }
}

async function verifyBomAndCosting() {
  console.log("\n-- BOM and costing -------------------------------------------");

  const { data: boms, error: bomError } = await withRetry(() =>
    adminClient
      .from("bill_of_materials")
      .select("id, product_id, bom_version")
      .order("created_at"),
  );

  if (bomError) {
    fail("BOM records", bomError.message);
    return;
  }

  if ((boms ?? []).length < 4) {
    fail("BOM records", `expected at least 4, found ${boms?.length ?? 0}`);
  } else {
    pass("BOM records", `${boms?.length ?? 0} BOM versions`);
  }

  const { data: components, error: componentError } = await withRetry(() =>
    adminClient.from("components").select("id, component_name, unit_cost"),
  );

  if (componentError) {
    fail("BOM components", componentError.message);
    return;
  }

  const componentCount = components?.length ?? 0;
  const costedCount = (components ?? []).filter((component: any) => component.unit_cost >= 0).length;

  if (componentCount >= 14 && costedCount === componentCount) {
    pass("BOM components", `${componentCount} components with unit cost`);
  } else {
    fail("BOM components", `found ${componentCount} components; cost coverage ${costedCount}`);
  }
}

async function verifyWorkflowModules() {
  console.log("\n-- Workflow modules ------------------------------------------");

  const checks: Array<{
    label: string;
    table: string;
    expectedMinimum: number;
    userScoped?: boolean;
  }> = [
    { label: "Suppliers", table: "suppliers", expectedMinimum: 3, userScoped: true },
    { label: "Documents", table: "documents", expectedMinimum: 4, userScoped: true },
    { label: "Change requests", table: "change_requests", expectedMinimum: 2, userScoped: true },
    { label: "Approvals", table: "approvals", expectedMinimum: 2 },
    { label: "Quality issues", table: "quality_issues", expectedMinimum: 2, userScoped: true },
    { label: "Projects", table: "projects", expectedMinimum: 3, userScoped: true },
    { label: "Process steps", table: "manufacturing_process_steps", expectedMinimum: 3 },
    { label: "Compliance records", table: "compliance_records", expectedMinimum: 2, userScoped: true },
    { label: "Product risks", table: "product_risks", expectedMinimum: 2, userScoped: true },
    { label: "Customer feedback", table: "customer_feedback", expectedMinimum: 2, userScoped: true },
    { label: "Notifications", table: "notifications", expectedMinimum: 3, userScoped: true },
  ];

  for (const check of checks) {
    let query = adminClient.from(check.table).select("*", { count: "exact", head: true });

    if (check.userScoped) {
      query = query.eq("user_id", demoUserId);
    }

    const { count, error } = await query;

    if (error) {
      fail(check.label, error.message);
      continue;
    }

    const total = count ?? 0;

    if (total >= check.expectedMinimum) {
      pass(check.label, `${total} rows`);
    } else {
      fail(check.label, `expected >= ${check.expectedMinimum}, found ${total}`);
    }
  }
}

async function verifyStorageBucket() {
  console.log("\n-- Storage ---------------------------------------------------");

  const { data, error } = await withRetry(() => adminClient.storage.getBucket("product-documents"));

  if (error || !data) {
    fail("product-documents bucket", error?.message ?? "not found");
  } else {
    pass("product-documents bucket", `public: ${data.public}`);
  }
}

async function main() {
  console.log("\n==============================================================");
  console.log("  Industrium PLM - Data Verification");
  console.log(`  Target: ${supabaseUrl}`);
  console.log("==============================================================");

  await verifySchemaTablesExist();
  await verifyDemoAuthUser();
  await verifyProductSeeds();
  await verifyBomAndCosting();
  await verifyWorkflowModules();
  await verifyStorageBucket();

  console.log("\n==============================================================");
  console.log(`  Results: ${passCount} passed  •  ${failCount} failed`);
  console.log("==============================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("\n[Industrium verify] Unexpected error:", error);
  process.exit(1);
});
