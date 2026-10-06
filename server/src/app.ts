import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import enquiryRoutes from "./routes/enquiry.routes";
import userRoutes from "./routes/user.routes";

export const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/users", userRoutes);

// 404 for unmatched API routes
app.use("/api", (_req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler — must be last
app.use(errorHandler);
