import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createAutomationSchema, updateAutomationSchema, runAutomationSchema } from "../types/schemas";
import * as controller from "../controllers/automationController";

const router = Router();

router.use(requireAuth);
router.get("/", controller.listAutomations);
router.post("/", validateBody(createAutomationSchema), controller.createAutomation);
router.get("/:id", controller.getAutomation);
router.put("/:id", validateBody(updateAutomationSchema), controller.updateAutomation);
router.delete("/:id", controller.deleteAutomation);
router.patch("/:id/toggle", controller.toggleAutomation);
router.post("/:id/run", validateBody(runAutomationSchema), controller.runAutomation);

export default router;
