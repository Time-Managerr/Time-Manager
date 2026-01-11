import express from "express";
import UserController from "../controllers/UserController.js";
import { verifyToken, authorizeProfile } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Only admins can create users
router.post("/", verifyToken, authorizeProfile(["admin"]), UserController.createUser);
// Listing and single read require auth; controller enforces role-specific filtering
router.get("/", verifyToken, UserController.getAllUsers);
router.get("/:id", verifyToken, UserController.getUserById);
// Update and delete require auth; controller enforces permissions
router.put("/:id", verifyToken, UserController.updateUser);
router.delete("/:id", verifyToken, authorizeProfile(["admin"]), UserController.deleteUser);

export default router;