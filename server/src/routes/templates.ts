import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listTemplates, useTemplate } from "../controllers/templateController";

const router = Router();

router.use(requireAuth);
router.get("/", listTemplates);
router.post("/:id/use", useTemplate);

export default router;
