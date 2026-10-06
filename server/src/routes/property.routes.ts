import { Router } from "express";
import {
  getProperties, getFeaturedProperties, getPropertyById,
  createProperty, updateProperty, deleteProperty,
} from "../controllers/property.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";
import { createPropertySchema, updatePropertySchema, propertyQuerySchema } from "../schemas/property.schema";

const router = Router();

router.get("/featured", getFeaturedProperties);
router.get("/", validate(propertyQuerySchema, "query"), getProperties);
router.get("/:id", getPropertyById);

// ── Admin-only mutations ──────────────────────────────────────────
router.post(
  "/",
  requireAuth, requireAdmin,
  upload.array("images", 10),          // max 10 images per listing
  validate(createPropertySchema),      // zod-validate AFTER multer populates req.body
  createProperty
);
router.patch("/:id", requireAuth, requireAdmin, validate(updatePropertySchema), updateProperty);
router.delete("/:id", requireAuth, requireAdmin, deleteProperty);

export default router;
