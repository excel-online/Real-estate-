import { Router } from "express";
import { createEnquiry, getEnquiries, updateEnquiryStatus } from "../controllers/enquiry.controller";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createEnquirySchema, updateEnquiryStatusSchema } from "../schemas/enquiry.schema";

const router = Router();

// optionalAuth attaches req.user if present without forcing login
router.post("/", optionalAuth, validate(createEnquirySchema), createEnquiry);

router.get("/", requireAuth, requireAdmin, getEnquiries);
router.patch("/:id", requireAuth, requireAdmin, validate(updateEnquiryStatusSchema), updateEnquiryStatus);

export default router;
