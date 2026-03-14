"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Factory, LayoutGrid, ShieldCheck } from "lucide-react";

import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  userName: string;
  roleLabel: string;
  children: ReactNode;
  signOutButton: ReactNode;
};

export function DashboardShell({
  userName,
  roleLabel,
  children,
  signOutButton,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-ink/10 bg-ink px-6 py-7 text-white shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent p-3 text-ink">
              <Factory className="size-6" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
                Industrium
              </p>
              <p className="text-lg font-semibold">Product PLM</p>
            </div>
          </div>

          <div className="mt-10 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70">Industrium PLM</p>
            <p className="mt-3 text-xl font-semibold">{userName}</p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent">
              {roleLabel}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/50">
              Shared team workspace
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                    isActive
                      ? "bg-white text-ink"
                      : "text-white/75 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <span>{item.label}</span>
                  {isActive ? <LayoutGrid className="size-4" /> : <ShieldCheck className="size-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">{signOutButton}</div>
        </aside>

        <main className="overflow-visible rounded-[32px] border border-ink/10 bg-[radial-gradient(circle_at_top_left,rgba(13,133,120,0.15),transparent_35%),linear-gradient(180deg,#fffdf8_0%,#f6f3ec_100%)] p-5 shadow-panel lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
