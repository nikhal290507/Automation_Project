import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { focusSessionSchema } from "../types/schemas";
import { getFocusStatus, startFocus, toggleFocus } from "../controllers/focusController";

const router = Router();
router.use(requireAuth);
router.get("/", getFocusStatus);
router.post("/", validateBody(focusSessionSchema), startFocus);
router.patch("/:id/toggle", toggleFocus);

export default router;
