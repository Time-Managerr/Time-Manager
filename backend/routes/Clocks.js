import express from "express";
import ClocksController from "../controllers/ClocksController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// All clock operations require authentication
router.post("/", verifyToken, ClocksController.clockIn);
router.put("/:idClock/clockout", verifyToken, ClocksController.clockOut);
router.get("/", verifyToken, ClocksController.getAllClocks);
router.get("/user/:userId", verifyToken, ClocksController.getClockByIdUser);
router.delete("/:id", verifyToken, ClocksController.deleteClock);

export default router;
