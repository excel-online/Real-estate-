import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

interface JwtPayload {
  id: string;
  role: string;
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) throw ApiError.unauthorized("Authentication required");

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(payload.id);

    if (!user) throw ApiError.unauthorized("User no longer exists");

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    throw ApiError.forbidden("Access denied: Admin privileges required");
  }
  next();
};

/** Like requireAuth but never rejects — for public endpoints that benefit from identity */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = (await User.findById(payload.id)) ?? undefined;
    } catch {
      /* invalid token → treat seamlessly as guest */
    }
  }
  next();
};
