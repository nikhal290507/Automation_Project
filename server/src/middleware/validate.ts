import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

// Validates req.body against a Zod schema and replaces it with the parsed
// (and therefore type-safe, coerced) result before the controller runs.
export const validateBody = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  req.body = schema.parse(req.body);
  next();
};
