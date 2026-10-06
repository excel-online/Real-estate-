import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  if (err instanceof Error && err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (err instanceof Error && err.name === "MongoServerError" && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: "Duplicate field value", details: (err as { keyValue?: object }).keyValue });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
}
