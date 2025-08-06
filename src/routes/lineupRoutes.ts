import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createOrUpdateLineup,
  getLineup,
  updatePlayerStats,
  addPlayerToLineup,
  removePlayerFromLineup,
} from '../controllers/lineup/lineupController';

const router = Router();

// Public routes
router.get('/fixture/:fixtureId/team/:teamId', getLineup as RequestHandler);

// Protected routes
router.post('/create', authenticate as RequestHandler, createOrUpdateLineup as RequestHandler);
router.put('/player-stats/:id', authenticate as RequestHandler, updatePlayerStats as RequestHandler);
router.post('/add-player/:id', authenticate as RequestHandler, addPlayerToLineup as RequestHandler);
router.delete('/remove-player/:id', authenticate as RequestHandler, removePlayerFromLineup as RequestHandler);

export default router;