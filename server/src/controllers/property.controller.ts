import { Request, Response } from "express";
import { Property, IProperty } from "../models/Property";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { geocodeAddress } from "../utils/geocode";

/**
 * GET /api/properties
 * Fetch properties with search filters, pagination, and sorting.
 */
export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    type,
    listingType,
    minPrice,
    maxPrice,
    beds,
    baths,
    city,
    state,
    status = "available",
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query: Record<string, any> = { isDeleted: false };

  if (status) query.status = status;
  if (type) query.type = type;
  if (listingType) query.listingType = listingType;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (beds) query.beds = { $gte: Number(beds) };
  if (baths) query.baths = { $gte: Number(baths) };

  if (city) query["location.city"] = new RegExp(String(city), "i");
  if (state) query["location.state"] = new RegExp(String(state), "i");

  if (search) {
    const searchRegex = new RegExp(String(search), "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { "location.address": searchRegex },
      { "location.city": searchRegex },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const sortOptions: Record<string, 1 | -1> = {
    [String(sortBy)]: sortOrder === "asc" ? 1 : -1,
  };

  const [properties, total] = await Promise.all([
    Property.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Property.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limitNum);

  res.json({
    data: properties,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages,
      hasMore: pageNum < pages,
    },
  });
});

/**
 * GET /api/properties/:id
 * Fetch a single property by ID.
 */
export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!property) {
    throw ApiError.notFound("Property not found");
  }

  res.json({ data: property });
});

/**
 * POST /api/properties
 * Create a new property listing (Admin only).
 */
export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const propertyData = { ...req.body };

  // Handle uploaded Cloudinary image files from Multer
  if (req.files && Array.isArray(req.files)) {
    propertyData.images = (req.files as Express.Multer.File[]).map(
      (file) => file.path
    );
  }

  // Parse location object if passed as flat or nested fields
  const address = propertyData["location.address"] || propertyData.location?.address;
  const city = propertyData["location.city"] || propertyData.location?.address?.city || propertyData.location?.city;
  const state = propertyData["location.state"] || propertyData.location?.address?.state || propertyData.location?.state;

  // Perform server-side geocoding to resolve GeoJSON coordinates
  const coordinates = await geocodeAddress(address, city, state);

  propertyData.location = {
    address,
    city,
    state,
    coordinates: {
      type: "Point",
      coordinates, // [lng, lat]
    },
  };

  // Ensure amenities are stored as an array
  if (typeof propertyData.amenities === "string") {
    propertyData.amenities = propertyData.amenities
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }

  const property = await Property.create(propertyData);

  res.status(201).json({ data: property });
});

/**
 * PATCH /api/properties/:id
 * Update an existing property listing (Admin only).
 */
export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!property) {
    throw ApiError.notFound("Property not found");
  }

  const updates = { ...req.body };

  // Append new images if uploaded
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImages = (req.files as Express.Multer.File[]).map(
      (file) => file.path
    );
    updates.images = [...(property.images || []), ...newImages];
  }

  // Handle location update and geocoding if address fields changed
  const address = updates["location.address"] || updates.location?.address || property.location.address;
  const city = updates["location.city"] || updates.location?.city || property.location.city;
  const state = updates["location.state"] || updates.location?.state || property.location.state;

  if (
    updates["location.address"] ||
    updates["location.city"] ||
    updates["location.state"] ||
    updates.location
  ) {
    const coordinates = await geocodeAddress(address, city, state);
    updates.location = {
      address,
      city,
      state,
      coordinates: {
        type: "Point",
        coordinates, // [lng, lat]
      },
    };
  }

  // Process amenities array if provided
  if (typeof updates.amenities === "string") {
    updates.amenities = updates.amenities
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json({ data: updatedProperty });
});

/**
 * DELETE /api/properties/:id
 * Soft delete a property listing (Admin only).
 */
export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!property) {
    throw ApiError.notFound("Property not found");
  }

  property.isDeleted = true;
  await property.save();

  res.json({ message: "Property soft-deleted successfully" });
});

/**
 * GET /api/properties/featured
 * Fetch featured properties.
 */
export const getFeaturedProperties = asyncHandler(async (req: Request, res: Response) => {
  const properties = await Property.find({ isDeleted: false, isFeatured: true }).limit(6);
  res.status(200).json({ success: true, count: properties.length, data: properties });
});
