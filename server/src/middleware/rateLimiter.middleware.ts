import rateLimit from "express-rate-limit";

/**
 * Strict rate limiter for sensitive authentication endpoints.
 * Prevents credential stuffing and brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    message: "Too many login/register attempts from this IP. Please try again after 10 minutes.",
  },
});
