import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      // Flatten field errors into a clean API response
      return next(ApiError.badRequest("Validation failed", result.error.flatten()));
    }
    req[source] = result.data; // replace with parsed/coerced values
    next();
  };
