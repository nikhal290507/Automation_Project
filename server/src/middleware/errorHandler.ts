import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../utils/env";

// Centralized error handler - never leaks stack traces or internals in production.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("[unhandled error]", err);

  return res.status(500).json({
    error: "Something went wrong on our end. Please try again.",
    ...(env.nodeEnv === "development" && err instanceof Error ? { debug: err.message } : {}),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}
