import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createPropertySchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  price: z.coerce.number().positive(),          // coerce: multipart sends strings
  listingType: z.enum(["sale", "rent"]),
  type: z.enum(["apartment", "house", "villa", "land", "commercial"]),
  "location.address": z.string().min(3),
  "location.city": z.string().min(2),
  "location.state": z.string().min(2),
  "location.coordinates.coordinates": z
    .string()
    .transform((s) => JSON.parse(s))             // sent as JSON string in multipart
    .pipe(z.tuple([z.number(), z.number()])),
  beds: z.coerce.number().int().min(0).default(0),
  baths: z.coerce.number().min(0).default(0),
  area: z.coerce.number().positive(),
  amenities: z.string().transform((s) => s.split(",")).pipe(z.array(z.string())).optional(),
});

export const updatePropertySchema = createPropertySchema.partial().omit({
  "location.coordinates.coordinates": true,
});

export const propertyQuerySchema = z.object({
  city: z.string().optional(),
  type: z.enum(["apartment", "house", "villa", "land", "commercial"]).optional(),
  listingType: z.enum(["sale", "rent"]).optional(),
  status: z.enum(["available", "sold", "rented"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  beds: z.coerce.number().int().optional(),
  baths: z.coerce.number().optional(),
  search: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "oldest"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  featured: z.enum(["true", "false"]).optional(),
});
