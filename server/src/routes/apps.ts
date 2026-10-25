import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { connectAppSchema } from "../types/schemas";
import { listApps, connectApp, disconnectApp } from "../controllers/appController";

const router = Router();

router.use(requireAuth);
router.get("/", listApps);
router.post("/connect", validateBody(connectAppSchema), connectApp);
router.delete("/:id", disconnectApp);

export default router;
