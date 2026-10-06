import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// requireAuth must run first — it populates req.user that requireAdmin checks
router.get("/dashboard", requireAuth, requireAdmin, getDashboardStats);

export default router;
