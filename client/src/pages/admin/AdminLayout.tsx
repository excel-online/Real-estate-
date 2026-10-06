import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Inbox, ArrowLeft, LogOut, Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

const NAV_ITEMS = [
  { to: "/admin",              icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/admin/properties",   icon: Building2,       label: "Properties", end: false },
  { to: "/admin/enquiries",    icon: Inbox,           label: "Enquiries",  end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pending-enquiry badge on the sidebar item — dashboard-grade polish
  const { data: pendingCount } = useQuery({
    queryKey: ["enquiries", "pending-count"],
    queryFn: async () => {
      const res = await api.get("/enquiries", { params: { status: "pending", limit: 1 } });
      return res.data.pagination.total;
    },
    refetchInterval: 60_000, // poll quietly — new leads shouldn't wait for a refresh
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <Building2 className="text-indigo-400" size={22} />
        <span className="text-lg font-bold text-white">EstateAdmin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }>
            <Icon size={18} />
            {label}
            {/* Pending leads badge — only on Enquiries */}
            {label === "Enquiries" && pendingCount !== undefined && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: back to site + logout */}
      <div className="space-y-1 border-t border-slate-800 p-4">
        <NavLink to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          <ArrowLeft size={18} /> View Site
        </NavLink>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-900 lg:block">
        {sidebar}
      </aside>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900">{sidebar}</aside>
        </div>
      )}

      {/* ── Main column ── */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu size={22} className="text-slate-600" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-500">Signed in as</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {user?.name}
            </span>
          </div>
        </header>

        {/* Routed admin page */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
