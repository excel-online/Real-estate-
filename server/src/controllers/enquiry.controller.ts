import { Request, Response } from "express";
import { Enquiry } from "../models/Enquiry";
import { Property } from "../models/Property";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/** POST /api/enquiries — public; logged-in users get userId stamped from JWT (if provided) */
export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId, guestName, email, phone, message, preferredDate } = req.body;

  const property = await Property.findOne({ _id: propertyId, isDeleted: false });
  if (!property) throw ApiError.notFound("Property not found");

  const enquiry = await Enquiry.create({
    propertyId,
    userId: req.user?._id, // set by optional auth middleware
    guestName: guestName ?? req.user?.name,
    email: email ?? req.user?.email,
    phone,
    message,
    preferredDate,
  });

  res.status(201).json({ data: enquiry });
});

/** GET /api/enquiries — admin; ?status=pending|contacted|closed filter */
export const getEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = "1", limit = "10" } = req.query as Record<string, string>;
  const filter = status ? { status } : {};

  const [total, enquiries] = await Promise.all([
    Enquiry.countDocuments(filter),
    Enquiry.find(filter)
      .populate("propertyId", "title images") // thumbnail + link in admin table
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
  ]);

  res.json({
    data: enquiries,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/** PATCH /api/enquiries/:id — admin updates pipeline status */
export const updateEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!enquiry) throw ApiError.notFound("Enquiry not found");
  res.json({ data: enquiry });
});

// Bulk update status handler
export const bulkUpdateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length || !status) {
      return res.status(400).json({ message: "Invalid payload: 'ids' array and 'status' are required." });
    }

    await Enquiry.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    res.json({ message: `Successfully updated ${ids.length} enquiries to ${status}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
