import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, Inbox, Clock, ArrowRight, Loader2, Plus } from "lucide-react";
import { api } from "../../lib/api";
import { formatPrice } from "../../lib/utils";

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  recentEnquiries: Array<{
    _id: string;
    guestName: string;
    email: string;
    createdAt: string;
    propertyId: { _id: string; title: string; price: number } | null;
  }>;
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await api.get("/admin/dashboard")).data,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-700">
        Failed to load dashboard metrics. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of property performance and incoming leads.</p>
        </div>
        <Link
          to="/admin/properties/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} /> Add Property
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total Listings</span>
            <Building2 size={20} className="text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalProperties}</p>
          <p className="mt-1 text-xs text-slate-400">{stats.activeProperties} active on market</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total Enquiries</span>
            <Inbox size={20} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalEnquiries}</p>
          <p className="mt-1 text-xs text-slate-400">Lifetime client leads</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Pending Leads</span>
            <Clock size={20} className="text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.pendingEnquiries}</p>
          <p className="mt-1 text-xs text-amber-600 font-medium">Requires follow-up</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Active Ratio</span>
            <Building2 size={20} className="text-sky-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {stats.totalProperties > 0
              ? Math.round((stats.activeProperties / stats.totalProperties) * 100)
              : 0}%
          </p>
          <p className="mt-1 text-xs text-slate-400">Available vs total</p>
        </div>
      </div>

      {/* ── Recent Enquiries Feed ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-semibold text-slate-900">Recent Leads</h2>
          <Link
            to="/admin/enquiries"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {stats.recentEnquiries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No recent enquiries yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentEnquiries.map((e) => (
              <div key={e._id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-slate-900">{e.guestName}</p>
                  <p className="text-xs text-slate-500">{e.email}</p>
                  <p className="mt-1 text-xs text-indigo-600 font-medium">
                    {e.propertyId ? e.propertyId.title : "Removed Property"}
                    {e.propertyId?.price && ` • ${formatPrice(e.propertyId.price)}`}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(e.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
