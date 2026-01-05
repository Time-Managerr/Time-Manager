import express from "express";
import TeamController from "../controllers/TeamsController.js";

const router = express.Router();

router.post("/", TeamController.createTeam);
router.get("/",TeamController.getAllTeams);
router.get("/:id",TeamController.getTeamById);
router.put("/:id", TeamController.updateTeam);
router.delete("/:id", TeamController.deleteTeam);

export default router;