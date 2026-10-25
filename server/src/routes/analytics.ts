import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getAnalytics } from "../controllers/analyticsController";

const router = Router();
router.use(requireAuth);
router.get("/", getAnalytics);

export default router;
