/**
 * Direct seed script for Industrium PLM.
 * Runs against the live Supabase project using keys from .env.local.
 *
 * Usage:  npx tsx scripts/seed-db.ts
 *
 * NOTE: The database schema (tables) must already exist.
 * If starting from scratch, run supabase/reset_and_seed.sql in the
 * Supabase SQL editor first, then this script is not needed.
 * Use this script to re-seed data only (safe upsert — no data loss for other users).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    process.env[key] = val;
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Constants ─────────────────────────────────────────────────────────────────
const DEMO_USER_ID = "aaaaaaaa-1111-4111-8111-111111111111";
const DEMO_EMAIL   = "simra.chandani@bacancy.com";
const DEMO_NAME    = "Simran Chandani";
const DEMO_PASS    = "DemoPass123!";

// ── Helpers ───────────────────────────────────────────────────────────────────
async function ok(label: string, fn: () => Promise<{ error: unknown }>) {
  const { error } = await fn();
  if (error) {
    console.warn(`  ⚠  ${label}:`, (error as { message?: string }).message ?? error);
  } else {
    console.log(`  ✓  ${label}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱  Seeding Industrium PLM database...\n");

  // ── Auth user ──────────────────────────────────────────────────────────────
  console.log("Auth user");
  const { data: existingUser } = await supabase.auth.admin.getUserById(DEMO_USER_ID);
  if (existingUser?.user) {
    await ok("Update user name", () =>
      supabase.auth.admin.updateUserById(DEMO_USER_ID, {
        user_metadata: { full_name: DEMO_NAME },
      })
    );
  } else {
    await ok("Create demo user", () =>
      supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASS,
        email_confirm: true,
        user_metadata: { full_name: DEMO_NAME },
        // @ts-expect-error supabase admin API supports id override
        id: DEMO_USER_ID,
      })
    );
  }

  // ── Public user profile ───────────────────────────────────────────────────
  console.log("\nUser profile");
  await ok("Upsert profile", () =>
    supabase.from("users").upsert(
      { id: DEMO_USER_ID, email: DEMO_EMAIL, full_name: DEMO_NAME },
      { onConflict: "id" }
    )
  );

  // ── Products ───────────────────────────────────────────────────────────────
  console.log("\nProducts");
  await ok("AeroFrame Structural Bracket", () =>
    supabase.from("products").upsert({
      id: "33333333-3333-3333-3333-333333333331",
      user_id: DEMO_USER_ID,
      product_name: "AeroFrame Structural Bracket",
      product_sku: "AFB-1001",
      product_category: "Aerospace",
      description: "High-strength titanium structural bracket for airframe assembly. Currently in fatigue validation and load cycle testing per AS9100 requirements.",
      lifecycle_stage: "testing",
    }, { onConflict: "id" })
  );
  await ok("HydroValve Pro Series", () =>
    supabase.from("products").upsert({
      id: "33333333-3333-3333-3333-333333333332",
      user_id: DEMO_USER_ID,
      product_name: "HydroValve Pro Series",
      product_sku: "HVP-2204",
      product_category: "Industrial",
      description: "High-pressure hydraulic control valve for industrial automation systems. Rated to 350 bar with modular actuator design for OEM integration.",
      lifecycle_stage: "prototype",
    }, { onConflict: "id" })
  );
  await ok("MediPump Infusion Module", () =>
    supabase.from("products").upsert({
      id: "33333333-3333-3333-3333-333333333333",
      user_id: DEMO_USER_ID,
      product_name: "MediPump Infusion Module",
      product_sku: "MPM-3050",
      product_category: "Medical Devices",
      description: "Precision infusion pump module for ambulatory drug delivery. IEC 60601 compliant design under review. Mechanical packaging finalization in progress.",
      lifecycle_stage: "design",
    }, { onConflict: "id" })
  );

  // ── Product versions ───────────────────────────────────────────────────────
  console.log("\nProduct versions");
  const versions = [
    { id: "44444444-4444-4444-4444-444444444440", product_id: "33333333-3333-3333-3333-333333333331", version_code: "v1.2", summary: "Baseline fatigue build prior to wall thickness revision and rib reinforcement.", is_current: false, created_by: DEMO_USER_ID },
    { id: "44444444-4444-4444-4444-444444444441", product_id: "33333333-3333-3333-3333-333333333331", version_code: "v1.3", summary: "Revised rib geometry and 3.5mm wall thickness candidate for DVT validation.", is_current: true, created_by: DEMO_USER_ID },
    { id: "44444444-4444-4444-4444-444444444442", product_id: "33333333-3333-3333-3333-333333333332", version_code: "v0.9", summary: "Pilot prototype with PTFE seal upgrade and updated actuator port geometry.", is_current: true, created_by: DEMO_USER_ID },
    { id: "44444444-4444-4444-4444-444444444443", product_id: "33333333-3333-3333-3333-333333333333", version_code: "v0.7", summary: "Initial packaging layout with peristaltic pump assembly and housing shell fit check.", is_current: true, created_by: DEMO_USER_ID },
  ];
  for (const v of versions) {
    await ok(`Version ${v.version_code} (${v.product_id.slice(-4)})`, () =>
      supabase.from("product_versions").upsert(v, { onConflict: "id" })
    );
  }

  // Update current_version_id on products
  const versionMap: Record<string, string> = {
    "33333333-3333-3333-3333-333333333331": "44444444-4444-4444-4444-444444444441",
    "33333333-3333-3333-3333-333333333332": "44444444-4444-4444-4444-444444444442",
    "33333333-3333-3333-3333-333333333333": "44444444-4444-4444-4444-444444444443",
  };
  for (const [pid, vid] of Object.entries(versionMap)) {
    await ok(`Set current version for ${pid.slice(-4)}`, () =>
      supabase.from("products").update({ current_version_id: vid }).eq("id", pid)
    );
  }

  // ── Suppliers ──────────────────────────────────────────────────────────────
  console.log("\nSuppliers");
  const suppliers = [
    { id: "55555555-5555-5555-5555-555555555551", user_id: DEMO_USER_ID, supplier_name: "Precision Metals Group", contact_email: "sourcing@precisionmetals.com", country: "Germany", status: "preferred", performance_score: 94.5 },
    { id: "55555555-5555-5555-5555-555555555552", user_id: DEMO_USER_ID, supplier_name: "FluidPower Systems Ltd", contact_email: "accounts@fluidpowersystems.com", country: "United States", status: "active", performance_score: 91.2 },
    { id: "55555555-5555-5555-5555-555555555553", user_id: DEMO_USER_ID, supplier_name: "MedTech Materials Co", contact_email: "supply@medtechmaterials.eu", country: "Netherlands", status: "preferred", performance_score: 96.8 },
  ];
  for (const s of suppliers) {
    await ok(s.supplier_name, () => supabase.from("suppliers").upsert(s, { onConflict: "id" }));
  }

  // ── BOMs ───────────────────────────────────────────────────────────────────
  console.log("\nBOMs");
  const boms = [
    { id: "66666666-6666-6666-6666-666666666660", product_id: "33333333-3333-3333-3333-333333333331", product_version_id: "44444444-4444-4444-4444-444444444440", bom_version: "BOM-v1.2" },
    { id: "66666666-6666-6666-6666-666666666661", product_id: "33333333-3333-3333-3333-333333333331", product_version_id: "44444444-4444-4444-4444-444444444441", bom_version: "BOM-v1.3" },
    { id: "66666666-6666-6666-6666-666666666662", product_id: "33333333-3333-3333-3333-333333333332", product_version_id: "44444444-4444-4444-4444-444444444442", bom_version: "BOM-v0.9" },
    { id: "66666666-6666-6666-6666-666666666663", product_id: "33333333-3333-3333-3333-333333333333", product_version_id: "44444444-4444-4444-4444-444444444443", bom_version: "BOM-v0.7" },
  ];
  for (const b of boms) {
    await ok(b.bom_version, () => supabase.from("bill_of_materials").upsert(b, { onConflict: "id" }));
  }

  // ── Components ─────────────────────────────────────────────────────────────
  console.log("\nComponents");
  const S1 = "55555555-5555-5555-5555-555555555551";
  const S2 = "55555555-5555-5555-5555-555555555552";
  const S3 = "55555555-5555-5555-5555-555555555553";
  const components = [
    // AeroFrame v1.2
    { id: "77777777-7777-7777-7777-777777777770", bom_id: "66666666-6666-6666-6666-666666666660", parent_component_id: null, supplier_id: S1, component_name: "Ti-6Al-4V Billet", component_sku: "CMP-TI-00", component_type: "module", manufacturer: "Precision Metals Group", quantity: 1, unit_cost: 142.00 },
    // AeroFrame v1.3
    { id: "77777777-7777-7777-7777-777777777771", bom_id: "66666666-6666-6666-6666-666666666661", parent_component_id: null, supplier_id: S1, component_name: "Ti-6Al-4V Billet", component_sku: "CMP-TI-01", component_type: "module", manufacturer: "Precision Metals Group", quantity: 1, unit_cost: 148.50 },
    { id: "77777777-7777-7777-7777-777777777772", bom_id: "66666666-6666-6666-6666-666666666661", parent_component_id: null, supplier_id: S1, component_name: "Fastener Kit", component_sku: "CMP-FKT-02", component_type: "mechanical", manufacturer: "Precision Metals Group", quantity: 1, unit_cost: 18.40 },
    { id: "77777777-7777-7777-7777-777777777773", bom_id: "66666666-6666-6666-6666-666666666661", parent_component_id: "77777777-7777-7777-7777-777777777772", supplier_id: S1, component_name: "M8 Titanium Bolts", component_sku: "CMP-M8B-03", component_type: "mechanical", manufacturer: "Precision Metals Group", quantity: 8, unit_cost: 1.85 },
    { id: "77777777-7777-7777-7777-777777777774", bom_id: "66666666-6666-6666-6666-666666666661", parent_component_id: "77777777-7777-7777-7777-777777777772", supplier_id: S1, component_name: "Aerospace Lockwashers", component_sku: "CMP-ALW-04", component_type: "mechanical", manufacturer: "Precision Metals Group", quantity: 8, unit_cost: 0.60 },
    { id: "77777777-7777-7777-7777-777777777775", bom_id: "66666666-6666-6666-6666-666666666661", parent_component_id: null, supplier_id: S1, component_name: "NDT Inspection Jig", component_sku: "CMP-NDT-05", component_type: "module", manufacturer: "Precision Metals Group", quantity: 1, unit_cost: 74.00 },
    // HydroValve v0.9
    { id: "77777777-7777-7777-7777-777777777776", bom_id: "66666666-6666-6666-6666-666666666662", parent_component_id: null, supplier_id: S2, component_name: "Valve Body Assembly", component_sku: "CMP-VBA-06", component_type: "module", manufacturer: "FluidPower Systems Ltd", quantity: 1, unit_cost: 84.90 },
    { id: "77777777-7777-7777-7777-777777777777", bom_id: "66666666-6666-6666-6666-666666666662", parent_component_id: "77777777-7777-7777-7777-777777777776", supplier_id: S2, component_name: "Stainless Steel Housing", component_sku: "CMP-SSH-07", component_type: "mechanical", manufacturer: "FluidPower Systems Ltd", quantity: 1, unit_cost: 32.50 },
    { id: "77777777-7777-7777-7777-777777777778", bom_id: "66666666-6666-6666-6666-666666666662", parent_component_id: "77777777-7777-7777-7777-777777777776", supplier_id: S2, component_name: "PTFE Actuator Seal Kit", component_sku: "CMP-ASK-08", component_type: "mechanical", manufacturer: "FluidPower Systems Ltd", quantity: 2, unit_cost: 9.80 },
    { id: "77777777-7777-7777-7777-777777777779", bom_id: "66666666-6666-6666-6666-666666666662", parent_component_id: null, supplier_id: S2, component_name: "Control Interface Board", component_sku: "CMP-CIB-09", component_type: "module", manufacturer: "FluidPower Systems Ltd", quantity: 1, unit_cost: 46.75 },
    { id: "77777777-7777-7777-7777-777777777780", bom_id: "66666666-6666-6666-6666-666666666662", parent_component_id: null, supplier_id: S2, component_name: "Pressure Sensor", component_sku: "CMP-PSR-10", component_type: "sensor", manufacturer: "FluidPower Systems Ltd", quantity: 1, unit_cost: 22.40 },
    // MediPump v0.7
    { id: "77777777-7777-7777-7777-777777777781", bom_id: "66666666-6666-6666-6666-666666666663", parent_component_id: null, supplier_id: S3, component_name: "Peristaltic Pump Assembly", component_sku: "CMP-PPA-11", component_type: "module", manufacturer: "MedTech Materials Co", quantity: 1, unit_cost: 68.20 },
    { id: "77777777-7777-7777-7777-777777777782", bom_id: "66666666-6666-6666-6666-666666666663", parent_component_id: null, supplier_id: S3, component_name: "Flow Rate Sensor", component_sku: "CMP-FRS-12", component_type: "sensor", manufacturer: "MedTech Materials Co", quantity: 1, unit_cost: 34.50 },
    { id: "77777777-7777-7777-7777-777777777783", bom_id: "66666666-6666-6666-6666-666666666663", parent_component_id: null, supplier_id: S3, component_name: "Stepper Drive Motor", component_sku: "CMP-SDM-13", component_type: "module", manufacturer: "MedTech Materials Co", quantity: 1, unit_cost: 29.90 },
    { id: "77777777-7777-7777-7777-777777777784", bom_id: "66666666-6666-6666-6666-666666666663", parent_component_id: null, supplier_id: S3, component_name: "Housing Shell", component_sku: "CMP-HSH-14", component_type: "mechanical", manufacturer: "MedTech Materials Co", quantity: 1, unit_cost: 14.60 },
  ];
  for (const c of components) {
    await ok(c.component_name, () => supabase.from("components").upsert(c, { onConflict: "id" }));
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  console.log("\nDocuments");
  const docs = [
    { id: "88888888-8888-8888-8888-888888888881", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", document_name: "aeroframe_fatigue_test_report_v1.3.pdf", document_type: "test_report", storage_path: `${DEMO_USER_ID}/33333333-3333-3333-3333-333333333331/aeroframe_fatigue_test_report_v1.3.pdf`, version: 3, uploaded_by: DEMO_USER_ID },
    { id: "88888888-8888-8888-8888-888888888882", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", document_name: "hydrovalve_assembly_cad.pdf", document_type: "cad", storage_path: `${DEMO_USER_ID}/33333333-3333-3333-3333-333333333332/hydrovalve_assembly_cad.pdf`, version: 1, uploaded_by: DEMO_USER_ID },
    { id: "88888888-8888-8888-8888-888888888883", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333333", document_name: "medipump_iec60601_specification.pdf", document_type: "specification", storage_path: `${DEMO_USER_ID}/33333333-3333-3333-3333-333333333333/medipump_iec60601_specification.pdf`, version: 2, uploaded_by: DEMO_USER_ID },
    { id: "88888888-8888-8888-8888-888888888884", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", document_name: "aeroframe_as9100_certification_packet.pdf", document_type: "compliance_certificate", storage_path: `${DEMO_USER_ID}/33333333-3333-3333-3333-333333333331/aeroframe_as9100_certification_packet.pdf`, version: 1, uploaded_by: DEMO_USER_ID },
    { id: "88888888-8888-8888-8888-888888888885", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", document_name: "hydrovalve_assembly_instructions.pdf", document_type: "assembly_instruction", storage_path: `${DEMO_USER_ID}/33333333-3333-3333-3333-333333333332/hydrovalve_assembly_instructions.pdf`, version: 1, uploaded_by: DEMO_USER_ID },
  ];
  for (const d of docs) {
    await ok(d.document_name, () => supabase.from("documents").upsert(d, { onConflict: "id" }));
  }

  // ── Change requests ────────────────────────────────────────────────────────
  console.log("\nChange requests");
  await ok("Bracket wall thickness revision", () =>
    supabase.from("change_requests").upsert({ id: "99999999-9999-9999-9999-999999999991", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", title: "Revise bracket wall thickness from 3mm to 3.5mm", description: "Fatigue test data shows micro-cracking near the rib section under peak load. Increasing wall thickness to 3.5mm is expected to improve cycle life beyond 50,000 load cycles.", status: "in_review", requested_by: DEMO_USER_ID }, { onConflict: "id" })
  );
  await ok("PTFE seal material upgrade", () =>
    supabase.from("change_requests").upsert({ id: "99999999-9999-9999-9999-999999999992", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", title: "Upgrade seal material to PTFE for high-temperature compatibility", description: "Field testing at 120°C revealed early seal degradation with the original NBR material. PTFE compound is rated to 200°C and has passed initial flow bench validation.", status: "approved", requested_by: DEMO_USER_ID }, { onConflict: "id" })
  );

  // ── Approvals ──────────────────────────────────────────────────────────────
  console.log("\nApprovals");
  await ok("Pending approval (bracket ECR)", () =>
    supabase.from("approvals").upsert({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1", change_request_id: "99999999-9999-9999-9999-999999999991", approver_id: DEMO_USER_ID, status: "pending", approved_at: null }, { onConflict: "id" })
  );
  await ok("Approved (seal ECR)", () =>
    supabase.from("approvals").upsert({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2", change_request_id: "99999999-9999-9999-9999-999999999992", approver_id: DEMO_USER_ID, status: "approved", approved_at: new Date(Date.now() - 2 * 86400000).toISOString() }, { onConflict: "id" })
  );

  // ── Quality issues ─────────────────────────────────────────────────────────
  console.log("\nQuality issues");
  await ok("AeroFrame micro-crack", () =>
    supabase.from("quality_issues").upsert({ id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", issue_title: "Micro-crack detected on rib section during fatigue load cycle", description: "Crack initiation observed at the rib-to-flange interface after 32,000 load cycles. Suspected stress concentration at the existing 3mm wall transition.", severity: "high", status: "investigating", reported_by: DEMO_USER_ID }, { onConflict: "id" })
  );
  await ok("HydroValve seal leak", () =>
    supabase.from("quality_issues").upsert({ id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", issue_title: "Seal leak detected at 200 bar pressure cycle", description: "Hydraulic fluid bypass measured at 0.4 ml/min across the actuator seal at maximum rated pressure. Initial analysis points to hardness variation in the NBR batch.", severity: "high", status: "open", reported_by: DEMO_USER_ID }, { onConflict: "id" })
  );

  // ── Projects ───────────────────────────────────────────────────────────────
  console.log("\nProjects");
  const projects = [
    { id: "cccccccc-cccc-cccc-cccc-ccccccccccc1", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", project_name: "AeroFrame DVT milestone", deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0], status: "testing" },
    { id: "cccccccc-cccc-cccc-cccc-ccccccccccc2", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", project_name: "HydroValve pilot build", deadline: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0], status: "prototype" },
    { id: "cccccccc-cccc-cccc-cccc-ccccccccccc3", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333333", project_name: "MediPump design freeze", deadline: new Date(Date.now() + 28 * 86400000).toISOString().split("T")[0], status: "design" },
  ];
  for (const p of projects) {
    await ok(p.project_name, () => supabase.from("projects").upsert(p, { onConflict: "id" }));
  }

  // ── Manufacturing steps ────────────────────────────────────────────────────
  console.log("\nManufacturing steps");
  const mfgSteps = [
    { id: "dddddddd-dddd-dddd-dddd-ddddddddddd1", product_id: "33333333-3333-3333-3333-333333333332", sequence_number: 10, step_name: "Valve body CNC machining", workstation: "Machining Cell 3 / Station A", instructions: "Load stainless steel billet into the 5-axis CNC. Run program HVP-v09-BODY. Measure bore diameter and surface finish after completion. Reject any unit outside ±0.02mm tolerance." },
    { id: "dddddddd-dddd-dddd-dddd-ddddddddddd2", product_id: "33333333-3333-3333-3333-333333333332", sequence_number: 20, step_name: "PTFE seal and O-ring installation", workstation: "Assembly Cell / Station C", instructions: "Install PTFE seal kit per drawing HVP-2204-ASM-020. Apply MoS2 lubricant to O-ring grooves. Confirm actuator travel is within 0.5mm of nominal before torquing end caps." },
    { id: "dddddddd-dddd-dddd-dddd-ddddddddddd3", product_id: "33333333-3333-3333-3333-333333333332", sequence_number: 30, step_name: "Hydrostatic pressure test and leak verification", workstation: "Test Bay / Bench B", instructions: "Pressurize to 385 bar (110% of rated) for 5 minutes. Inspect all joints and seals for leakage using fluorescent dye penetrant. Quarantine and tag any unit with visible bypass." },
  ];
  for (const s of mfgSteps) {
    await ok(s.step_name, () => supabase.from("manufacturing_process_steps").upsert(s, { onConflict: "id" }));
  }

  // ── Compliance records ─────────────────────────────────────────────────────
  console.log("\nCompliance records");
  await ok("AS9100 Rev D certification", () =>
    supabase.from("compliance_records").upsert({ id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", document_id: "88888888-8888-8888-8888-888888888884", compliance_name: "AS9100 Rev D certification", authority: "AS9100", status: "needs_review", due_date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0], notes: "Awaiting updated fatigue test report with revised wall thickness data before resubmission to the certifying authority." }, { onConflict: "id" })
  );
  await ok("ISO 9001 quality management system", () =>
    supabase.from("compliance_records").upsert({ id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", compliance_name: "ISO 9001 quality management system", authority: "ISO", status: "valid", due_date: new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0], validated_at: new Date(Date.now() - 8 * 86400000).toISOString(), notes: "PTFE seal material substitution remains within approved material classification. No re-submission required." }, { onConflict: "id" })
  );

  // ── Product risks ──────────────────────────────────────────────────────────
  console.log("\nProduct risks");
  await ok("Ti-6Al-4V billet lead time risk", () =>
    supabase.from("product_risks").upsert({ id: "ffffffff-ffff-ffff-ffff-fffffffffff1", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", risk_title: "Ti-6Al-4V billet lead time extends DVT schedule", description: "Primary supplier quoting 14-week lead time on next billet order due to raw material allocation constraints. This may delay DVT start by 6 weeks.", severity: "high", status: "monitoring", mitigation_plan: "Qualify secondary supplier and order safety stock of two billets to cover DVT and early PVT builds.", owner_name: "Simran Chandani" }, { onConflict: "id" })
  );
  await ok("Seal thermal cycling risk", () =>
    supabase.from("product_risks").upsert({ id: "ffffffff-ffff-ffff-ffff-fffffffffff2", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", risk_title: "Seal integrity under repeated thermal cycling", description: "PTFE seal shows dimensional change after 200 thermal cycles between -20°C and 120°C in accelerated life testing.", severity: "critical", status: "identified", mitigation_plan: "Run additional 500-cycle thermal endurance test on PTFE seal compound. Evaluate alternative PEEK-reinforced seal as fallback.", owner_name: "Simran Chandani" }, { onConflict: "id" })
  );

  // ── Customer feedback ──────────────────────────────────────────────────────
  console.log("\nCustomer feedback");
  await ok("Orion Aerospace Systems", () =>
    supabase.from("customer_feedback").upsert({ id: "12121212-1212-4212-8212-121212121211", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", customer_name: "Orion Aerospace Systems", channel: "sales_call", rating: 4, feedback_text: "Impressed with the weight-to-strength ratio on the v1.3 prototype. Awaiting the updated fatigue report before committing to the production forecast for the next airframe program." }, { onConflict: "id" })
  );
  await ok("Nordic Industrial Automation", () =>
    supabase.from("customer_feedback").upsert({ id: "12121212-1212-4212-8212-121212121212", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", customer_name: "Nordic Industrial Automation", channel: "support_ticket", rating: 5, feedback_text: "The PTFE seal upgrade has solved the high-temperature bypass issue entirely. Pilot installation has been running at 115°C for three weeks with zero leakage." }, { onConflict: "id" })
  );

  // ── Notifications ──────────────────────────────────────────────────────────
  console.log("\nNotifications");
  const notifications = [
    { id: "13131313-1313-4313-8313-131313131311", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", title: "Wall thickness change request is in review", message: "The AeroFrame bracket thickness revision is awaiting approval closure before DVT build release.", level: "warning", related_path: "/dashboard/changes", is_read: false },
    { id: "13131313-1313-4313-8313-131313131312", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333332", title: "PTFE seal upgrade approved", message: "HydroValve seal material change can move into pilot production build.", level: "success", related_path: "/dashboard/changes", is_read: false },
    { id: "13131313-1313-4313-8313-131313131313", user_id: DEMO_USER_ID, product_id: "33333333-3333-3333-3333-333333333331", title: "AS9100 evidence needs refresh", message: "AeroFrame compliance package is missing the revised fatigue test data required for AS9100 resubmission.", level: "warning", related_path: "/dashboard/products/33333333-3333-3333-3333-333333333331", is_read: false },
  ];
  for (const n of notifications) {
    await ok(n.title, () => supabase.from("notifications").upsert(n, { onConflict: "id" }));
  }

  console.log("\n✅  Seed complete!\n");
  console.log(`   Login:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASS}\n`);
}

seed().catch((err) => { console.error(err); process.exit(1); });
