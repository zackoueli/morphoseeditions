"use client";

import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink/50">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 sm:px-6">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
