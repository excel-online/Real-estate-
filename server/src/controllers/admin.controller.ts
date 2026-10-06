import { Request, Response } from "express";
import { Property } from "../models/Property";
import { Enquiry } from "../models/Enquiry";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * GET /api/admin/dashboard
 * One aggregated round-trip — the dashboard renders from a single query.
 * $facet runs all four counts in parallel inside MongoDB.
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [stats] = await Property.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        totalListings: [{ $count: "n" }],
        activeListings: [{ $match: { status: "available" } }, { $count: "n" }],
        soldProperties: [{ $match: { status: "sold" } }, { $count: "n" }],
        rentedProperties: [{ $match: { status: "rented" } }, { $count: "n" }],
        byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
      },
    },
  ]);

  const totalEnquiries = await Enquiry.countDocuments();

  const recentProperties = await Property.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title price status type createdAt")
    .lean();

  const recentEnquiries = await Enquiry.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("propertyId", "title")
    .lean();

  res.json({
    totalListings:    stats?.totalListings[0]?.n    ?? 0,
    activeListings:   stats?.activeListings[0]?.n   ?? 0,
    soldProperties:   stats?.soldProperties[0]?.n   ?? 0,
    rentedProperties: stats?.rentedProperties[0]?.n ?? 0,
    totalEnquiries,
    listingsByType:   stats?.byType ?? [],
    recentProperties,
    recentEnquiries,
  });
});
