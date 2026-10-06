import { Link } from "react-router-dom";
import { Bed, Bath, Maximize2, MapPin, Heart } from "lucide-react";
import { useState } from "react";
import type { Property } from "../../types";
import { formatPrice } from "../../lib/utils";
import { useToggleSaved } from "../../hooks/useSavedProperties";

const statusStyles: Record<Property["status"], string> = {
  available: "bg-emerald-500",
  sold:      "bg-rose-500",
  rented:    "bg-sky-500",
};

export default function PropertyCard({ property }: { property: Property }) {
  const [imgIndex, setImgIndex] = useState(0);
  const { isSaved, toggle } = useToggleSaved(property._id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-lg hover:ring-slate-900/10">
      {/* ── Image with hover-swap gallery ── */}
      <Link to={`/properties/${property._id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={property.images[imgIndex]?.url}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onMouseEnter={() => property.images.length > 1 && setImgIndex(1)}
          onMouseLeave={() => setImgIndex(0)}
        />

        {/* Badges — pointer-events-none so clicks pass to the Link */}
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${statusStyles[property.status]}`}>
            {property.status === "available"
              ? property.listingType === "rent" ? "For Rent" : "For Sale"
              : property.status}
          </span>
          {property.isFeatured && (
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-950">
              Featured
            </span>
          )}
        </div>

        {/* Favorite toggle — stopPropagation prevents navigation */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(); }}
          aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow transition hover:scale-110"
        >
          <Heart size={18} className={isSaved ? "fill-rose-500 text-rose-500" : "text-slate-600"} />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/80 px-3 py-1.5 text-white backdrop-blur">
          <span className="text-lg font-bold">{formatPrice(property.price)}</span>
          {property.listingType === "rent" && <span className="text-sm text-slate-300">/mo</span>}
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-indigo-600">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} /> {property.location.city}, {property.location.state}
          </p>
        </div>

        {/* Specs row — hidden for land listings where beds/baths are meaningless */}
        {property.type !== "land" && (
          <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Bed size={16} /> {property.beds}</span>
            <span className="flex items-center gap-1.5"><Bath size={16} /> {property.baths}</span>
            <span className="flex items-center gap-1.5"><Maximize2 size={16} /> {property.area.toLocaleString()} ft²</span>
          </div>
        )}
      </div>
    </div>
  );
}
