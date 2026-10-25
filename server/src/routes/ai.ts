import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { classifyEmailSchema, generateReplySchema, generateAutomationSchema } from "../types/schemas";
import { classify, reply, createAutomationFromPrompt } from "../controllers/aiController";

const router = Router();
router.use(requireAuth);
router.post("/classify-email", validateBody(classifyEmailSchema), classify);
router.post("/generate-reply", validateBody(generateReplySchema), reply);
router.post("/create-automation", validateBody(generateAutomationSchema), createAutomationFromPrompt);

export default router;
