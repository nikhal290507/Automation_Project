import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getBilling, upgrade, downgrade } from "../controllers/billingController";

const router = Router();
router.use(requireAuth);
router.get("/", getBilling);
router.post("/upgrade", upgrade);
router.post("/downgrade", downgrade);

export default router;
