import express from "express";
import RolesController from "../controllers/RolesController.js";
import { verifyToken, authorizeProfile } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, authorizeProfile(["admin"]), RolesController.createRole);
router.get("/", verifyToken, authorizeProfile(["admin"]), RolesController.getAllRoles);
router.get("/:id", verifyToken, authorizeProfile(["admin"]), RolesController.getRoleById);
router.put("/:id", verifyToken, authorizeProfile(["admin"]), RolesController.updateRole);
router.delete("/:id", verifyToken, authorizeProfile(["admin"]), RolesController.deleteRole);

export default router;