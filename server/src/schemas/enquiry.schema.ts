import { z } from "zod";

export const createEnquirySchema = z.object({
  property: z.string().min(1, "Property ID is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(["pending", "contacted", "closed"]),
});

export const bulkStatusUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one enquiry ID is required"),
  status: z.enum(["pending", "contacted", "closed"]),
});
