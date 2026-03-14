import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ConfigurationAlert } from "@/components/dashboard/configuration-alert";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SignOutButton } from "@/components/forms/sign-out-button";
import { getSessionContext } from "@/lib/data/auth";
import { getPublicEnvironmentStatus } from "@/lib/env";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return (
      <main className="min-h-screen px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ConfigurationAlert missingKeys={environmentStatus.missingKeys} />
        </div>
      </main>
    );
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    redirect("/login");
  }

  return (
    <DashboardShell
      userName={sessionContext.profile.full_name}
      signOutButton={<SignOutButton />}
    >
      {children}
    </DashboardShell>
  );
}
