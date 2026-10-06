import { Search, SlidersHorizontal } from "lucide-react";
import type { PropertyFilters, PropertyType } from "../../types";

const PROPERTY_TYPES: { value: PropertyType | ""; label: string }[] = [
  { value: "",        label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "house",     label: "House" },
  { value: "villa",     label: "Villa" },
  { value: "land",      label: "Land" },
  { value: "commercial", label: "Commercial" },
];

interface Props {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
}

/**
 * Debounced onChange pattern: local form state updates instantly,
 * parent (URL/search state) only updates after typing pauses —
 * so we don't hammer the API on every keystroke.
 */
export default function PropertyFilterBar({ filters, onChange }: Props) {
  const set = (patch: Partial<PropertyFilters>) =>
    onChange({ ...filters, ...patch, page: 1 }); // any filter change resets pagination

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      {/* Row 1: Search + listing type toggle */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, keyword, or city…"
            value={filters.search ?? ""}
            onChange={(e) => set({ search: e.target.value })}
            className="w-full rounded-xl border-0 bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Buy / Rent segmented control */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
          {(["", "sale", "rent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set({ listingType: t })}
              className={`rounded-lg px-4 py-1.5 transition ${
                filters.listingType === t ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "" ? "All" : t === "sale" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Selects + price range */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <select value={filters.type ?? ""} onChange={(e) => set({ type: e.target.value as PropertyType | "" })}
          className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500">
          {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select value={filters.beds ?? ""} onChange={(e) => set({ beds: e.target.value ? Number(e.target.value) : "" })}
          className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500">
          <option value="">Any Beds</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ Beds</option>)}
        </select>

        <select value={filters.baths ?? ""} onChange={(e) => set({ baths: e.target.value ? Number(e.target.value) : "" })}
          className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500">
          <option value="">Any Baths</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ Baths</option>)}
        </select>

        <input type="number" placeholder="Min price" value={filters.minPrice ?? ""}
          onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : "" })}
          className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" />

        <input type="number" placeholder="Max price" value={filters.maxPrice ?? ""}
          onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : "" })}
          className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" />

        <select value={filters.sort ?? "newest"} onChange={(e) => set({ sort: e.target.value as PropertyFilters["sort"] })}
          className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
    </div>
  );
}
