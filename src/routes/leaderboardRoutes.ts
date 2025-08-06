import { Router, RequestHandler } from "express";
import {
  getTournamentLeaderboard,
  getTopScorers,
  getPlayerTournamentStats,
  getPlayerAllStats,
  getGoldenBootLeaderboard,
  getAssistsLeaderboard,
  getGoldenGloveLeaderboard,
  getTournamentStandings,
  getTopAssists,
  getTopSave,
  getTournamentAwards,
} from "../controllers/leaderboard/leaderboardController";

const router = Router();

// All public routes
router.get(
  "/tournament/:tournamentId",
  getTournamentLeaderboard as RequestHandler
);
router.get("/top-scorers", getTopAssists as RequestHandler);
router.get("/top-assists", getTopScorers as RequestHandler);
router.get("/top-save", getTopSave as RequestHandler);
router.get(
  "/player/:playerId/tournament/:tournamentId",
  getPlayerTournamentStats as RequestHandler
);
router.get("/player/:playerId", getPlayerAllStats as RequestHandler);
router.get("/awards/:tournamentId", getTournamentAwards as RequestHandler);
router.get(
  "/golden-boot/:tournamentId",
  getGoldenBootLeaderboard as RequestHandler
);
router.get("/assists/:tournamentId", getAssistsLeaderboard as RequestHandler);
router.get(
  "/golden-glove/:tournamentId",
  getGoldenGloveLeaderboard as RequestHandler
);
router.get(
  "/standings/:tournamentId",
  getTournamentStandings as RequestHandler
);

export default router;
