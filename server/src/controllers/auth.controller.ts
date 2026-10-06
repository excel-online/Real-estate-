import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

// ── Helpers ───────────────────────────────────────────────────────

function signToken(user: IUser): string {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/** Never expose passwordHash — project only safe fields */
function toSafeUser(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    savedProperties: user.savedProperties,
  };
}

function setAuthCookie(res: Response, token: string) {
  // HttpOnly cookie: NOT readable by JS (XSS-safe). Sent automatically on same-site requests.
  // If you use Bearer-header auth only, this is optional but good defense-in-depth.
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",   // HTTPS only in prod
    sameSite: "lax",                          // blocks CSRF on cross-site POSTs
    maxAge: 7 * 24 * 60 * 60 * 1000,          // must match JWT_EXPIRES_IN
    path: "/",
  });
}

// ── Handlers ──────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  // We assign the raw password to passwordHash — the pre-save hook hashes it.
  // Alternative: a virtual 'password' field; explicit assignment is clearer here.
  const user = await User.create({ name, email, passwordHash: password, role: "user" });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({ token, user: toSafeUser(user) });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // .select("+passwordHash") — the field is hidden by default (select: false)
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  // Same generic message for both failure paths — prevents user enumeration

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({ token, user: toSafeUser(user) });
});

/**
 * POST /api/auth/logout
 * Client-side we just delete the token; server-side we expire the cookie.
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out successfully" });
});

/**
 * GET /api/auth/me
 * requireAuth middleware already loaded req.user from the DB.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: toSafeUser(req.user!) });
});
