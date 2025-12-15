import express from "express";
import PlanningController from "../controllers/PlanningController.js";

const router = express.Router();

router.get("/", PlanningController.getPlanning);
router.post("/:id", PlanningController.createPlanning);

export default router;
