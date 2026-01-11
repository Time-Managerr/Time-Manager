import express from "express";
import TeamController from "../controllers/TeamController.js";
import { verifyToken, authorizeProfile } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Only managers and admins can create teams
router.post("/", verifyToken, authorizeProfile(["admin", "manager"]), TeamController.createTeam);
// Listing requires auth; controller filters visibility
router.get("/", verifyToken, TeamController.getAllTeams);
router.get("/:id", verifyToken, TeamController.getTeamById);
router.get("/user/:userId", verifyToken, TeamController.getTeamByUserId);
// Update/Delete restricted to team manager or admin
router.put("/:id", verifyToken, authorizeProfile(["admin", "manager"]), TeamController.updateTeam);
router.delete("/:id", verifyToken, authorizeProfile(["admin", "manager"]), TeamController.deleteTeam);

export default router;