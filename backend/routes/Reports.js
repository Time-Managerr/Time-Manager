import express from "express";
import ReportsController from "../controllers/ReportsController.js";
import { verifyToken, authorizeProfile } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Admin only for now
router.post("/", verifyToken, authorizeProfile(["admin"]), ReportsController.createReport);
router.get("/", verifyToken, authorizeProfile(["admin"]), ReportsController.getAllReports);
router.get("/:id", verifyToken, authorizeProfile(["admin"]), ReportsController.getReportById);
router.put("/:id", verifyToken, authorizeProfile(["admin"]), ReportsController.updateReport);
router.delete("/:id", verifyToken, authorizeProfile(["admin"]), ReportsController.deleteReport);

export default router;