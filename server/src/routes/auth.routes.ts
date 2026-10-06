import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

// Apply authLimiter specifically to public auth mutation endpoints
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
