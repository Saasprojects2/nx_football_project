import { Router, RequestHandler } from 'express';

import {
  getPlayerTournamentStats

} from '../controllers/player/playerController';

const router = Router();

// Public routes
router.get('/tournament-stats/:playerId', getPlayerTournamentStats as RequestHandler);

export default router;