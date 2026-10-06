import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Loader2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProperties } from "../../hooks/useProperties";
import { api } from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import type { Property } from "../../types";
import { TableRowSkeleton } from "../../components/ui/Skeletons";

const STATUS_COLORS: Record<Property["status"], string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  sold:      "bg-rose-50 text-rose-700 ring-rose-200",
  rented:    "bg-sky-50 text-sky-700 ring-sky-200",
};

export default function AdminPropertiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Server-side search: debounced so typing doesn't fire a request per keystroke
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Debounce manually
  const onSearchChange = (value: string) => {
    setSearchInput(value);
    window.clearTimeout((onSearchChange as any)._t);
    (onSearchChange as any)._t = window.setTimeout(() => setDebouncedSearch(value), 400);
  };

  const { properties, pagination, isLoading } = useProperties({
    search: debouncedSearch,
    status: statusFilter as "available" | "sold" | "rented" | undefined,
    sort: "newest",
    page: 1,
    limit: 20,
  });

  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setDeleteTarget(null);
    },
  });

  return (
    <div>
      {/* ── Header row ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500">{pagination?.total ?? 0} listings</p>
        </div>
        <Link to="/admin/properties/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={18} /> Add Property
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search listings…"
            className="w-full rounded-xl bg-white py-2.5 pl-9 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-white px-4 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500">
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3.5">Property</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Listed</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : (
                <>
                  {properties.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]?.url} alt={p.title} className="h-11 w-16 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1 max-w-[220px]">{p.title}</p>
                            <p className="text-xs text-slate-500">{p.location.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600">{p.type}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{formatPrice(p.price)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_COLORS[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => navigate(`/admin/properties/${p._id}/edit`)}
                            title="Edit" className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(p)}
                            title="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {properties.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No listings match your filters.</td></tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Delete listing?</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">"{deleteTarget.title}"</span> will be removed from public view.
              This is a soft delete — historical enquiries are preserved.
            </p>
            {deleteMutation.isError && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {(deleteMutation.error as Error).message}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
