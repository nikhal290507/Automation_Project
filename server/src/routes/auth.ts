import { Router } from "express";
import { register, login, me } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../types/schemas";
import { requireAuth } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.get("/me", requireAuth, me);

export default router;
