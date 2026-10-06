import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  requireAdmin?: boolean; // true → admin-only area
}

export default function ProtectedRoute({ requireAdmin = false }: Props) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Full-screen loader while we resolve the token — prevents route flicker
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Not logged in → send to login, remembering where they were headed
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but wrong role → back to the public site
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
