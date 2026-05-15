"use client";

import { useAuthGuard } from "@/src/shared/view/hooks/use-auth-guard";
import { AppSidebar } from "@/src/shared/view/components/app-sidebar";
import { FullPageSpinner } from "@/src/shared/view/components/spinner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthGuard();

  if (loading) return <FullPageSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-svh bg-background">
      <AppSidebar user={user} />
      <main className="flex min-h-svh flex-col pb-16 md:pb-0 md:pl-60">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
