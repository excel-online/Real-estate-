import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { X, UploadCloud } from "lucide-react";
import { useEffect } from "react";
import { api } from "../../lib/api";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useProperty } from "../../hooks/useProperties";
import type { Property } from "../../types";

// ── Validation schema (multipart-friendly: numbers coerce from strings) ──
const propertyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  listingType: z.enum(["sale", "rent"]),
  type: z.enum(["apartment", "house", "villa", "land", "commercial"]),
  status: z.enum(["available", "sold", "rented"]).default("available"),
  "location.address": z.string().min(3),
  "location.city": z.string().min(2),
  "location.state": z.string().min(2),
  beds: z.coerce.number().int().min(0),
  baths: z.coerce.number().min(0),
  area: z.coerce.number().positive(),
  amenities: z.string(), // comma-separated input, split on submit
});
type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function PropertyFormPage() {
  const { id } = useParams(); // present → edit mode, absent → create
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pending, addFiles, removeFile, appendTo } = useImageUpload();

  const { data: existing } = useProperty(id ?? "", { enabled: isEdit });

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({ resolver: zodResolver(propertyFormSchema) });

  // Hydrate the form once the existing property loads (edit mode)
  useEffect(() => {
    if (existing) {
      const p = existing as Property;
      reset({
        title: p.title,
        description: p.description,
        price: p.price,
        listingType: p.listingType,
        type: p.type,
        status: p.status,
        "location.address": p.location.address,
        "location.city": p.location.city,
        "location.state": p.location.state,
        beds: p.beds,
        baths: p.baths,
        area: p.area,
        amenities: p.amenities.join(", "),
      });
    }
  }, [existing, reset]);

  const onSubmit = async (values: PropertyFormValues) => {
    // multipart/form-data: build manually, don't JSON.stringify
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value)));
    formData.set("amenities", values.amenities); // stays a comma string; server splits it

    // Coordinates must ride along: geocode address or fetch from a
    // hidden field — sent as JSON string because FormData only carries strings.
    formData.set(
      "location.coordinates.coordinates",
      JSON.stringify(existing?.location.coordinates.coordinates ?? [3.3792, 6.5244])
    );

    appendTo(formData); // attach the pending image files

    if (isEdit) {
      await api.patch(`/properties/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Invalidate so lists/dash reflect the change immediately
    await queryClient.invalidateQueries({ queryKey: ["properties"] });
    navigate("/admin/properties");
  };

  const inputCls =
    "mt-1 w-full rounded-xl bg-slate-50 px-4 py-2.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500";
  const err = (msg?: string) => msg && <p className="mt-1 text-xs text-rose-600">{msg}</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? "Edit Property" : "Add New Property"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
        {/* ── Section 1: Basics ── */}
        <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-900/5">
          <h2 className="font-semibold text-slate-800">Basic Information</h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input {...register("title")} className={inputCls} />
            {err(errors.title?.message)}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea rows={4} {...register("description")} className={inputCls} />
            {err(errors.description?.message)}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { name: "listingType" as const, label: "Listing", options: [["sale","For Sale"],["rent","For Rent"]] },
              { name: "type" as const, label: "Property Type", options: [["apartment","Apartment"],["house","House"],["villa","Villa"],["land","Land"],["commercial","Commercial"]] },
              { name: "status" as const, label: "Status", options: [["available","Available"],["sold","Sold"],["rented","Rented"]] },
              { name: "price" as const, label: "Price", options: null },
            ].map((f) => (
              <div key={f.name}>
                <label className="text-sm font-medium text-slate-700">{f.label}</label>
                {f.options ? (
                  <select {...register(f.name)} className={inputCls}>
                    {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : (
                  <input type="number" {...register(f.name)} className={inputCls} />
                )}
                {err(errors[f.name]?.message)}
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Location & Specs ── */}
        <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-900/5">
          <h2 className="font-semibold text-slate-800">Location & Specifications</h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Street Address</label>
            <input {...register("location.address")} className={inputCls} />
            {err(errors["location.address"]?.message)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">City</label>
              <input {...register("location.city")} className={inputCls} />
              {err(errors["location.city"]?.message)}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">State</label>
              <input {...register("location.state")} className={inputCls} />
              {err(errors["location.state"]?.message)}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Bedrooms</label>
              <input type="number" {...register("beds")} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Bathrooms</label>
              <input type="number" {...register("baths")} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Area (sqft)</label>
              <input type="number" {...register("area")} className={inputCls} />
              {err(errors.area?.message)}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Amenities (comma-separated)</label>
              <input placeholder="pool, gym, parking" {...register("amenities")} className={inputCls} />
            </div>
          </div>
        </section>

        {/* ── Section 3: Image Upload ── */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-900/5">
          <h2 className="font-semibold text-slate-800">Images {isEdit && "(new uploads are appended)"}</h2>

          <label
            className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
          >
            <UploadCloud size={28} />
            <span className="text-sm">Click to upload (max 10, 5MB each — jpg/png/webp)</span>
            <input
              type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </label>

          {pending.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {pending.map((img, i) => (
                <div key={img.previewUrl} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={img.previewUrl} className="h-full w-full object-cover" />
                  <button
                    type="button" onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex gap-3">
          <button
            type="submit" disabled={isSubmitting || (!isEdit && pending.length === 0)}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Listing"}
          </button>
          <button
            type="button" onClick={() => navigate(-1)}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
