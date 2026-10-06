import { useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bed, Bath, Maximize2, MapPin, Calendar, Phone, Mail,
  ChevronLeft, ChevronRight, X, Check, Loader2, Heart,
} from "lucide-react";
import { useProperty } from "../hooks/useProperties";
import { useToggleSaved } from "../hooks/useSavedProperties";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useMutation } from "@tanstack/react-query";
import { formatPrice } from "../lib/utils";

// ── Enquiry form schema ───────────────────────────────────────────
const enquirySchema = z.object({
  guestName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().min(10, "Please include a short message"),
});
type EnquiryFormValues = z.infer<typeof enquirySchema>;

// ── Amenities checklist ──
const AMENITY_LABELS: Record<string, string> = {
  parking: "Parking", pool: "Swimming Pool", gym: "Gym",
  balcony: "Balcony", furnished: "Furnished", "air-conditioning": "Air Conditioning",
  security: "24/7 Security", elevator: "Elevator", garden: "Garden",
  "pet-friendly": "Pet Friendly", wifi: "Wi-Fi", "power-backup": "Power Backup",
};

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: property, isLoading, error } = useProperty(id!);
  const { isSaved, toggle } = useToggleSaved(id ?? "");

  // Gallery state: index + lightbox
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { guestName: user?.name ?? "", email: user?.email ?? "" },
  });

  const enquiryMutation = useMutation({
    mutationFn: async (values: EnquiryFormValues) =>
      api.post("/enquiries", { ...values, propertyId: id }),
    onSuccess: () => {
      reset({ guestName: user?.name ?? "", email: user?.email ?? "", phone: "", preferredDate: "", message: "" });
    },
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  if (error || !property) return <div className="flex min-h-screen items-center justify-center text-slate-500">Property not found.</div>;

  const [lng, lat] = property.location.coordinates.coordinates;
  const prevImg = () => setActiveImg((i) => (i === 0 ? property.images.length - 1 : i - 1));
  const nextImg = () => setActiveImg((i) => (i === property.images.length - 1 ? 0 : i + 1));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ══════ GALLERY ══════ */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <img src={property.images[activeImg]?.url} alt={property.title} className="h-full w-full object-cover" />

        {property.images.length > 1 && (
          <>
            <button onClick={prevImg} aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImg} aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <button onClick={() => setLightbox(true)}
          className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/80">
          {activeImg + 1} / {property.images.length}
        </button>

        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold text-white ${
          property.status === "available" ? "bg-emerald-500" : property.status === "sold" ? "bg-rose-500" : "bg-sky-500"
        }`}>
          {property.status === "available"
            ? property.listingType === "rent" ? "For Rent" : "For Sale"
            : property.status}
        </span>
      </div>

      {property.images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {property.images.map((img, i) => (
            <button key={img.publicId} onClick={() => setActiveImg(i)}
              className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === activeImg ? "ring-indigo-500" : "ring-transparent hover:ring-slate-300"
              }`}>
              <img src={img.url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightbox(false)}>
          <button className="absolute right-4 top-4 text-white"><X size={28} /></button>
          <img src={property.images[activeImg]?.url} alt={property.title} className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ══════ MAIN GRID ══════ */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{property.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-slate-500">
                <MapPin size={16} /> {property.location.address}, {property.location.city}, {property.location.state}
              </p>
            </div>
            <button onClick={toggle} aria-label="Save property"
              className="rounded-full bg-slate-100 p-3 hover:bg-slate-200">
              <Heart size={20} className={isSaved ? "fill-rose-500 text-rose-500" : "text-slate-600"} />
            </button>
          </div>

          <p className="mt-4 text-3xl font-bold text-indigo-600">
            {formatPrice(property.price)}
            {property.listingType === "rent" && <span className="text-base font-normal text-slate-400"> /month</span>}
          </p>

          {property.type !== "land" && (
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 text-center">
              {[
                { icon: Bed,        label: "Bedrooms",  value: property.beds },
                { icon: Bath,       label: "Bathrooms", value: property.baths },
                { icon: Maximize2,  label: "Area",      value: `${property.area.toLocaleString()} ft²` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <Icon size={20} className="mx-auto text-indigo-600" />
                  <p className="mt-1 font-semibold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-8 font-semibold text-slate-900">About this property</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">{property.description}</p>

          {property.amenities.length > 0 && (
            <>
              <h2 className="mt-8 font-semibold text-slate-900">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={16} className="text-emerald-500" />
                    {AMENITY_LABELS[a] ?? a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="mt-8 font-semibold text-slate-900">Location</h2>
          <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-50 p-6 text-center text-slate-500">
            <p className="font-medium text-slate-700">Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
            <p className="text-sm text-slate-400 mt-1">{property.location.address}, {property.location.city}</p>
          </div>
        </div>

        {/* ── Right: agent card + enquiry form ── */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                {property.agentId.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{property.agentId.name}</p>
                <p className="text-sm text-slate-500">Listing Agent</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Mail size={14} /> {property.agentId.email}</p>
              {property.agentId.phone && <p className="flex items-center gap-2"><Phone size={14} /> {property.agentId.phone}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
            <h3 className="font-semibold text-slate-900">Schedule a Tour / Contact Agent</h3>

            {enquiryMutation.isSuccess && (
              <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                Enquiry sent! The agent will reach out shortly.
              </div>
            )}
            {enquiryMutation.isError && (
              <div className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {(enquiryMutation.error as Error).message}
              </div>
            )}

            <form onSubmit={handleSubmit((v) => enquiryMutation.mutate(v))} className="mt-4 space-y-3" noValidate>
              <input {...register("guestName")} placeholder="Your name" className={inputCls} />
              {errors.guestName && <p className="text-xs text-rose-600">{errors.guestName.message}</p>}

              <input {...register("email")} type="email" placeholder="Email" className={inputCls} />
              {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}

              <input {...register("phone")} type="tel" placeholder="Phone (optional)" className={inputCls} />

              <div>
                <label className="flex items-center gap-1.5 text-sm text-slate-600 mb-1">
                  <Calendar size={14} /> Preferred tour date (optional)
                </label>
                <input {...register("preferredDate")} type="date" className={inputCls} />
              </div>

              <textarea {...register("message")} rows={3} placeholder="I'm interested in this property…" className={inputCls} />
              {errors.message && <p className="text-xs text-rose-600">{errors.message.message}</p>}

              <button type="submit" disabled={enquiryMutation.isPending}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                {enquiryMutation.isPending ? "Sending…" : "Send Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-slate-50 px-4 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500";
