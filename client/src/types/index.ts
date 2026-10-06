export type PropertyType = "apartment" | "house" | "villa" | "land" | "commercial";
export type PropertyStatus = "available" | "sold" | "rented";

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  listingType: "sale" | "rent";
  type: PropertyType;
  status: PropertyStatus;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: { coordinates: [number, number] }; // [lng, lat]
  };
  beds: number;
  baths: number;
  area: number;
  amenities: string[];
  images: { url: string; publicId: string }[];
  agentId: Agent;
  isFeatured: boolean;
  createdAt: string;
}

export interface PropertyFilters {
  city?: string;
  type?: PropertyType | "";
  listingType?: "sale" | "rent" | "";
  minPrice?: number | "";
  maxPrice?: number | "";
  beds?: number | "";
  baths?: number | "";
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; pages: number; hasMore: boolean };
}

export interface Enquiry {
  _id: string;
  propertyId: string | { _id: string; title: string };
  guestName?: string;
  email: string;
  phone?: string;
  message: string;
  preferredDate?: string;
  status: "pending" | "contacted" | "closed";
  createdAt: string;
}
