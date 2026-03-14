import type { UserRole } from "@/lib/types/database";

type DemoAccount = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type RoleCapability =
  | "manage_products"
  | "manage_compliance"
  | "manage_quality"
  | "manage_suppliers";

export const DEMO_WORKSPACE_OWNER_ID = "aaaaaaaa-1111-4111-8111-111111111111";
export const DEMO_DEFAULT_PASSWORD = "demo123";
export const DEMO_LEGACY_PASSWORD = "DemoPass123!";

export const demoAccounts: DemoAccount[] = [
  {
    id: DEMO_WORKSPACE_OWNER_ID,
    email: "simra.chandani@bacancy.com",
    fullName: "Simran Chandani",
    role: "product_manager",
  },
  {
    id: "bbbbbbbb-2222-4222-8222-222222222222",
    email: "compliance@industrium.io",
    fullName: "Avery Compliance",
    role: "compliance_manager",
  },
  {
    id: "cccccccc-3333-4333-8333-333333333333",
    email: "quality@industrium.io",
    fullName: "Jordan Quality",
    role: "quality_engineer",
  },
  {
    id: "dddddddd-4444-4444-8444-444444444444",
    email: "suppliers@industrium.io",
    fullName: "Morgan Supplier",
    role: "supplier_manager",
  },
];

export const demoAccountsByEmail = new Map(
  demoAccounts.map((account) => [account.email.toLowerCase(), account]),
);

export const roleLabels: Record<UserRole, string> = {
  product_manager: "Product Manager",
  compliance_manager: "Compliance Manager",
  quality_engineer: "Quality Engineer",
  supplier_manager: "Supplier Manager",
};

export const roleCapabilities: Record<UserRole, RoleCapability[]> = {
  product_manager: ["manage_products"],
  compliance_manager: ["manage_compliance"],
  quality_engineer: ["manage_quality"],
  supplier_manager: ["manage_suppliers"],
};

export const dashboardFocusByRole: Record<
  UserRole,
  { title: string; description: string; highlights: string[] }
> = {
  product_manager: {
    title: "Portfolio command center",
    description:
      "Track lifecycle progress, BOM readiness, change activity, and delivery milestones across the shared team workspace.",
    highlights: ["Product portfolio", "Lifecycle stages", "Open change requests"],
  },
  compliance_manager: {
    title: "Compliance control center",
    description:
      "Review the shared product set, monitor certification status, and keep regulatory evidence ready for audit discussions.",
    highlights: ["Compliance approvals", "Regulatory documents", "Certification status"],
  },
  quality_engineer: {
    title: "Quality command center",
    description:
      "Stay on top of defects, validation outcomes, and product risk signals while working from the same shared program data.",
    highlights: ["Open quality issues", "Testing results", "Risk signals"],
  },
  supplier_manager: {
    title: "Supplier operations center",
    description:
      "Review the shared portfolio, supplier relationships, and vendor performance trends that support active products.",
    highlights: ["Supplier directory", "Vendor status", "Performance score"],
  },
};

export function normalizeRole(value: string | null | undefined): UserRole {
  if (
    value === "product_manager" ||
    value === "compliance_manager" ||
    value === "quality_engineer" ||
    value === "supplier_manager"
  ) {
    return value;
  }

  return "product_manager";
}

export function getDemoAccountByEmail(email: string | null | undefined) {
  if (!email) {
    return null;
  }

  return demoAccountsByEmail.get(email.trim().toLowerCase()) ?? null;
}

export function isDemoCredentials(email: string, password: string) {
  const account = getDemoAccountByEmail(email);
  return Boolean(
    account && (password === DEMO_DEFAULT_PASSWORD || password === DEMO_LEGACY_PASSWORD),
  );
}

export function resolveUserRole(input: { email?: string | null; role?: string | null }) {
  const seededAccount = getDemoAccountByEmail(input.email ?? null);
  return normalizeRole(input.role ?? seededAccount?.role);
}

export function resolveWorkspaceOwnerId(input: { email?: string | null; role?: string | null; id: string }) {
  return getDemoAccountByEmail(input.email ?? null) ? DEMO_WORKSPACE_OWNER_ID : input.id;
}

export function hasCapability(role: UserRole, capability: RoleCapability) {
  return roleCapabilities[role].includes(capability);
}
