import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { User } from "../models/User";

const router = Router();

// Get current user profile
router.get("/profile", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user?._id).select("-password");
  res.status(200).json({ success: true, data: user });
}));

// Update user profile
router.patch("/profile", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    (req as any).user?._id,
    { name, email },
    { new: true, runValidators: true }
  ).select("-password");
  res.status(200).json({ success: true, data: user });
}));

export default router;
