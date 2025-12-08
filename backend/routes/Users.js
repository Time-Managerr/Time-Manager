import express from "express";
import UserController from "../controllers/UserController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/", UserController.createUser);
router.get("/", verifyToken, UserController.getAllUsers);
router.get("/:id", verifyToken, UserController.getUserById);
router.put("/:id", verifyToken, UserController.updateUser);
router.delete("/:id", verifyToken, UserController.deleteUser);

export default router;