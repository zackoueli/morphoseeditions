import { AdminAuthProvider } from "@/components/admin/admin-auth-context";
import { AdminGate } from "@/components/admin/admin-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-paper text-ink">
        <AdminGate>{children}</AdminGate>
      </div>
    </AdminAuthProvider>
  );
}
