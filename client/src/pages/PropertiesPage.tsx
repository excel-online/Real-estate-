import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Building2, Bed, Bath, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { useProperties } from "../hooks/useProperties";
import { formatPrice } from "../lib/utils";
import { PropertyCardSkeleton } from "../components/ui/Skeletons";

export default function PropertiesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [listingType, setListingType] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [page, setPage] = useState(1);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    window.clearTimeout((onSearchChange as any)._t);
    (onSearchChange as any)._t = window.setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const { properties, pagination, isLoading } = useProperties({
    search: debouncedSearch,
    type: type || undefined,
    listingType: listingType || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    limit: 9,
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Browse Properties</h1>
          <p className="mt-2 text-slate-600">Find your dream home or investment opportunity.</p>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search city, address, or title..."
                className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>

            <select
              value={listingType}
              onChange={(e) => { setListingType(e.target.value); setPage(1); }}
              className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Buy or Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="Min Price"
                className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder="Max Price"
                className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center ring-1 ring-slate-900/5">
              <Building2 className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-semibold text-slate-900">No properties found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <Link
                  key={p._id}
                  to={`/properties/${p._id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={p.images[0]?.url}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur-md">
                      For {p.listingType}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xl font-bold text-slate-900">{formatPrice(p.price)}</p>
                    <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1">{p.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      {p.location.address}, {p.location.city}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1"><Bed size={15} /> {p.beds} Beds</span>
                      <span className="flex items-center gap-1"><Bath size={15} /> {p.baths} Baths</span>
                      <span className="flex items-center gap-1"><Maximize size={15} /> {p.area} sqft</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600">
              Showing page <span className="font-semibold text-slate-900">{pagination.page}</span> of{" "}
              <span className="font-semibold text-slate-900">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
