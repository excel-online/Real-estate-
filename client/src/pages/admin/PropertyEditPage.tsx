import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Plus, X } from "lucide-react";
import { api } from "../../lib/api";
import { useProperty } from "../../hooks/useProperties";

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price is required"),
  type: z.enum(["house", "apartment", "condo", "land", "commercial"]),
  listingType: z.enum(["sale", "rent"]),
  status: z.enum(["available", "sold", "rented"]),
  beds: z.coerce.number().min(0),
  baths: z.coerce.number().min(0),
  area: z.coerce.number().min(0),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().optional(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingProperty, isLoading: loadingProperty } = useProperty(id ?? "");

  const [images, setImages] = useState<Array<{ url: string; publicId: string }>>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: "house",
      listingType: "sale",
      status: "available",
      beds: 1,
      baths: 1,
      area: 500,
      lat: 6.5244,
      lng: 3.3792,
    },
  });

  useEffect(() => {
    if (isEdit && existingProperty) {
      reset({
        title: existingProperty.title,
        description: existingProperty.description,
        price: existingProperty.price,
        type: existingProperty.type,
        listingType: existingProperty.listingType,
        status: existingProperty.status,
        beds: existingProperty.beds,
        baths: existingProperty.baths,
        area: existingProperty.area,
        address: existingProperty.location.address,
        city: existingProperty.location.city,
        state: existingProperty.location.state,
        zipCode: existingProperty.location.zipCode ?? "",
        lat: existingProperty.location.coordinates.coordinates[1],
        lng: existingProperty.location.coordinates.coordinates[0],
      });
      setImages(existingProperty.images || []);
      setAmenities(existingProperty.amenities || []);
    }
  }, [isEdit, existingProperty, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      const payload = {
        title: values.title,
        description: values.description,
        price: values.price,
        type: values.type,
        listingType: values.listingType,
        status: values.status,
        beds: values.beds,
        baths: values.baths,
        area: values.area,
        images,
        amenities,
        location: {
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          coordinates: {
            type: "Point",
            coordinates: [values.lng, values.lat],
          },
        },
      };

      if (isEdit) {
        return api.put(`/properties/${id}`, payload);
      }
      return api.post("/properties", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      navigate("/admin/properties");
    },
  });

  const addImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, { url: imageUrlInput.trim(), publicId: `img_${Date.now()}` }]);
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (!amenityInput.trim()) return;
    const formatted = amenityInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!amenities.includes(formatted)) {
      setAmenities((prev) => [...prev, formatted]);
    }
    setAmenityInput("");
  };

  const removeAmenity = (item: string) => {
    setAmenities((prev) => prev.filter((a) => a !== item));
  };

  if (isEdit && loadingProperty) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <button
        onClick={() => navigate("/admin/properties")}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Back to Properties
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit Property Listing" : "Add New Property"}
        </h1>
      </div>

      <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-6">
        {saveMutation.isError && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            {(saveMutation.error as Error).message}
          </div>
        )}

        {/* ── Basic Info ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 space-y-4">
          <h2 className="font-semibold text-slate-900">Basic Information</h2>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Property Title</label>
            <input {...register("title")} className={inputCls} placeholder="e.g. Modern Luxury Villa in Lekki" />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Description</label>
            <textarea {...register("description")} rows={4} className={inputCls} placeholder="Detailed overview..." />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Price (₦ or $)</label>
              <input type="number" {...register("price")} className={inputCls} />
              {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Property Type</label>
              <select {...register("type")} className={inputCls}>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Listing Purpose</label>
              <select {...register("listingType")} className={inputCls}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Status</label>
              <select {...register("status")} className={inputCls}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Bedrooms</label>
              <input type="number" {...register("beds")} className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Bathrooms</label>
              <input type="number" {...register("baths")} className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Area (sq ft)</label>
              <input type="number" {...register("area")} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Location ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 space-y-4">
          <h2 className="font-semibold text-slate-900">Location Details</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Street Address</label>
              <input {...register("address")} className={inputCls} />
              {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">City</label>
              <input {...register("city")} className={inputCls} />
              {errors.city && <p className="mt-1 text-xs text-rose-600">{errors.city.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">State</label>
              <input {...register("state")} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Zip Code</label>
              <input {...register("zipCode")} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Latitude</label>
              <input step="any" type="number" {...register("lat")} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Longitude</label>
              <input step="any" type="number" {...register("lng")} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Images ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 space-y-4">
          <h2 className="font-semibold text-slate-900">Property Photos</h2>

          <div className="flex gap-2">
            <input
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Enter image URL..."
              className={inputCls}
            />
            <button
              type="button"
              onClick={addImage}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={i} className="group relative aspect-video overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                <img src={img.url} alt={`Listing ${i}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-rose-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Amenities ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 space-y-4">
          <h2 className="font-semibold text-slate-900">Amenities</h2>

          <div className="flex gap-2">
            <input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              placeholder="e.g. pool, gym, parking"
              className={inputCls}
            />
            <button
              type="button"
              onClick={addAmenity}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {amenities.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {item}
                <button type="button" onClick={() => removeAmenity(item)} className="hover:text-rose-600">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ── Submit Action ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/properties")}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Update Property" : "Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-slate-50 px-4 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500";
