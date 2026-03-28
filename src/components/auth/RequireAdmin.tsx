import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsAdmin } from "@/hooks/useRole";
import { Loader2 } from "lucide-react";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  if (!user) return <Navigate to="/auth" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
