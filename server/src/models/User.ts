import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  savedProperties: mongoose.Types.ObjectId[]; // refs to Property
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: { type: String, required: true, select: false }, // never leak by default
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, trim: true },
    avatar: { type: String }, // Cloudinary URL
    savedProperties: [{ type: Schema.Types.ObjectId, ref: "Property", default: [] }],
  },
  { timestamps: true }
);

// Hash password before saving — only when modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Prevent duplicate registration race conditions at the DB level too
userSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
