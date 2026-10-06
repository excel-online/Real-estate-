import mongoose, { Schema, Document, Model } from "mongoose";

export type PropertyType = "apartment" | "house" | "villa" | "land" | "commercial";
export type PropertyStatus = "available" | "sold" | "rented";

export interface ILocation {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  // GeoJSON Point for $near queries & map rendering
  coordinates: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
}

export interface IPropertyImage {
  url: string;        // Cloudinary secure_url
  publicId: string;   // needed to delete from Cloudinary later
}

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  listingType: "sale" | "rent"; // Buy vs Rent
  type: PropertyType;
  status: PropertyStatus;
  location: ILocation;
  beds: number;
  baths: number;
  area: number; // sqft
  yearBuilt?: number;
  amenities: string[]; // ["parking", "pool", "gym", ...]
  images: IPropertyImage[];
  agentId: mongoose.Types.ObjectId;
  isFeatured: boolean;
  isDeleted: boolean; // soft delete
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    listingType: { type: String, enum: ["sale", "rent"], required: true },
    type: {
      type: String,
      enum: ["apartment", "house", "villa", "land", "commercial"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available",
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    beds: { type: Number, min: 0, default: 0 },
    baths: { type: Number, min: 0, default: 0 },
    area: { type: Number, required: true, min: 0 },
    yearBuilt: { type: Number },
    amenities: [{ type: String, lowercase: true, trim: true }],
    images: [
      {
        _id: false, // managed as embedded docs
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Critical indexes for the search/filter feature set
propertySchema.index({ "location.coordinates": "2dsphere" }); // geo queries
propertySchema.index({ price: 1 });                            // price range filtering
propertySchema.index({ type: 1, listingType: 1, status: 1 });  // composite filter
propertySchema.index({ title: "text", description: "text", "location.city": "text" }); // full-text search

// Public listings only — applied by default in queries via controller
propertySchema.statics.active = function () {
  return this.find({ isDeleted: false });
};

export const Property: Model<IProperty> = mongoose.model<IProperty>("Property", propertySchema);
