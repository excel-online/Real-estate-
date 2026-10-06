import mongoose, { Schema, Document, Model } from "mongoose";

export type EnquiryStatus = "pending" | "contacted" | "closed";

export interface IEnquiry extends Document {
  propertyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;   // optional — guests can enquire too
  guestName?: string;                 // required only if userId absent
  email: string;
  phone?: string;
  message: string;
  preferredDate?: Date;               // for "Schedule a Tour"
  status: EnquiryStatus;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestName: {
      type: String,
      // Business rule: anonymous enquiries must provide a name
      required: function (this: IEnquiry) { return !this.userId; },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    phone: { type: String, trim: true },
    message: { type: String, required: true, maxlength: 2000 },
    preferredDate: { type: Date },
    status: { type: String, enum: ["pending", "contacted", "closed"], default: "pending", index: true },
  },
  { timestamps: true } // createdAt doubles as "submitted at"
);

export const Enquiry: Model<IEnquiry> = mongoose.model<IEnquiry>("Enquiry", enquirySchema);
