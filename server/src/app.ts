import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./utils/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import automationRoutes from "./routes/automations";
import templateRoutes from "./routes/templates";
import appRoutes from "./routes/apps";
import activityRoutes from "./routes/activity";
import focusRoutes from "./routes/focus";
import aiRoutes from "./routes/ai";
import dashboardRoutes from "./routes/dashboard";
import analyticsRoutes from "./routes/analytics";
import billingRoutes from "./routes/billing";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use("/api", apiRateLimiter);

app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/automations", automationRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/apps", appRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/billing", billingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
