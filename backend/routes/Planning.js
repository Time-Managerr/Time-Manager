import express from "express";
import PlanningController from "../controllers/PlanningController.js";
import { verifyToken, authorizeProfile } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, PlanningController.getPlanning);
router.post("/", verifyToken, authorizeProfile(["admin","manager"]), PlanningController.createPlanning);
router.put("/:id", verifyToken, authorizeProfile(["admin","manager"]), PlanningController.updatePlanning);
router.delete("/:id", verifyToken, authorizeProfile(["admin"]), PlanningController.deletePlanning);

export default router;
