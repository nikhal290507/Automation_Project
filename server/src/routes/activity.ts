import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listActivity } from "../controllers/activityController";

const router = Router();
router.use(requireAuth);
router.get("/", listActivity);

export default router;
