import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Inbox, Loader2, Mail, Phone, Calendar, CheckSquare, Square } from "lucide-react";
import { api } from "../../lib/api";
import type { Enquiry, PaginatedResponse } from "../../types";

type EnquiryStatus = "pending" | "contacted" | "closed";

const STATUS_TABS: { value: EnquiryStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGE: Record<EnquiryStatus, string> = {
  pending:  "bg-amber-50 text-amber-700 ring-amber-200",
  contacted:"bg-indigo-50 text-indigo-700 ring-indigo-200",
  closed:   "bg-slate-100 text-slate-600 ring-slate-200",
};

interface EnquiryRow extends Omit<Enquiry, "propertyId"> {
  propertyId: { _id: string; title: string; images: { url: string }[] } | null;
}

export default function AdminEnquiriesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<EnquiryStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery<PaginatedResponse<EnquiryRow>>({
    queryKey: ["enquiries", status, page],
    queryFn: async () => {
      const res = await api.get("/enquiries", { params: { status: status || undefined, page, limit: 10 } });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const enquiries = data?.data ?? [];
  const pagination = data?.pagination;

  // Single status change
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) =>
      api.patch(`/enquiries/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  // Bulk status change
  const bulkMutation = useMutation({
    mutationFn: async (targetStatus: EnquiryStatus) =>
      api.patch("/enquiries/bulk-status", { ids: selectedIds, status: targetStatus }),
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === enquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enquiries.map((e) => e._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
          <p className="text-sm text-slate-500">{pagination?.total ?? 0} total leads</p>
        </div>

        {enquiries.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {selectedIds.length === enquiries.length ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
            Select All
          </button>
        )}
      </div>

      {/* ── Status tabs ── */}
      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); setSelectedIds([]); }}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              status === tab.value ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {status === tab.value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* ── Bulk Actions Bar (Shown when items are checked) ── */}
      {selectedIds.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm font-medium">
            <span className="rounded-md bg-indigo-500 px-2 py-0.5 font-bold text-white">{selectedIds.length}</span> lead(s) selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => bulkMutation.mutate("contacted")}
              disabled={bulkMutation.isPending}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              Mark Contacted
            </button>
            <button
              onClick={() => bulkMutation.mutate("closed")}
              disabled={bulkMutation.isPending}
              className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
            >
              Mark Closed
            </button>
            <button
              onClick={() => bulkMutation.mutate("pending")}
              disabled={bulkMutation.isPending}
              className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500 disabled:opacity-50"
            >
              Mark Pending
            </button>
          </div>
        </div>
      )}

      {/* ── Enquiry Cards List ── */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
      ) : enquiries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
          <Inbox size={40} />
          <p className="text-sm">No {status || ""} enquiries.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {enquiries.map((e) => {
            const isSelected = selectedIds.includes(e._id);
            return (
              <div
                key={e._id}
                className={`relative rounded-2xl bg-white p-5 ring-1 transition ${
                  isSelected ? "ring-2 ring-indigo-600 bg-indigo-50/20" : "ring-slate-900/5 hover:ring-slate-200"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Selection Checkbox */}
                  <div className="flex items-start pt-1">
                    <button type="button" onClick={() => toggleSelectOne(e._id)} className="text-slate-400 hover:text-indigo-600">
                      {isSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                    </button>
                  </div>

                  {/* Thumbnail */}
                  {e.propertyId && (
                    <Link to={`/properties/${e.propertyId._id}`} className="flex-shrink-0">
                      <img src={e.propertyId.images?.[0]?.url} alt={e.propertyId.title} className="h-20 w-28 rounded-lg object-cover" />
                    </Link>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold text-slate-900">{e.guestName ?? "Registered user"}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_BADGE[e.status]}`}>
                        {e.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(e.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Re: {e.propertyId?.title ?? "(property removed)"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                        <Mail size={14} /> {e.email}
                      </a>
                      {e.phone && (
                        <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                          <Phone size={14} /> {e.phone}
                        </a>
                      )}
                      {e.preferredDate && (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <Calendar size={14} /> Tour: {new Date(e.preferredDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{e.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                    {e.status === "pending" && (
                      <button onClick={() => statusMutation.mutate({ id: e._id, status: "contacted" })}
                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                        Mark Contacted
                      </button>
                    )}
                    {e.status !== "closed" && (
                      <button onClick={() => statusMutation.mutate({ id: e._id, status: "closed" })}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                        Close
                      </button>
                    )}
                    {e.status === "closed" && (
                      <button onClick={() => statusMutation.mutate({ id: e._id, status: "pending" })}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-white px-4 py-2 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40">
              Previous
            </button>
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-white px-4 py-2 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
