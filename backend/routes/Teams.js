import express from "express";
import TeamController from "../controllers/TeamController.js";

const router = express.Router();

router.post("/", TeamController.createTeam);
router.get("/",TeamController.getAllTeams);
router.get("/:id",TeamController.getTeamById);
router.get("/user/:userId", TeamController.getTeamByUserId);
router.put("/:id", TeamController.updateTeam);
router.delete("/:id", TeamController.deleteTeam);

export default router;