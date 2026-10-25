import { Router } from "express";
import { getMe, updateMe } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateMeSchema } from "../types/schemas";

const router = Router();

router.use(requireAuth);
router.get("/me", getMe);
router.put("/me", validateBody(updateMeSchema), updateMe);

export default router;
