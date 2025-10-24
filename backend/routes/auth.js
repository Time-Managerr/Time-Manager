import express from "express";
import AuthController from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/login", AuthController.login);
router.get("/profile", verifyToken, AuthController.profile);

export default router;
