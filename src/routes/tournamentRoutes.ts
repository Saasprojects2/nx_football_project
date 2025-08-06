import { Request, Response,RequestHandler, NextFunction } from "express";

const router = require("express").Router();
import { authenticate } from "../middlewares/authMiddleware";
import { createTournament,getAllTournaments, getTournamentById, updateTournament, deleteTournament, addTeamToTournament,removeTeamFromTournament, getMyTournaments,getPastTournaments,
    getCurrentTournaments,
    getFutureTournaments } from "../controllers/tournament/tournamentController";

router.get("/all",getAllTournaments as RequestHandler);
router.get("/all/:id",getTournamentById as RequestHandler);
router.get('/past', getPastTournaments);
router.get('/current', getCurrentTournaments);
router.get('/future', getFutureTournaments);



// Protected routes
router.post("/create", authenticate, createTournament as RequestHandler);
router.put('/update/:id', authenticate, updateTournament);
router.delete('/delete/:id', authenticate, deleteTournament);
router.post('/add-team', authenticate, addTeamToTournament);
router.delete('/:tournamentId/teams/:teamId', authenticate, removeTeamFromTournament);
router.get('/user/my-tournaments', authenticate, getMyTournaments);



export default router;

