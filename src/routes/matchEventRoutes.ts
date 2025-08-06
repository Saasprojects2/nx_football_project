import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createMatchEvent,
  getMatchEventsByFixture,
  deleteMatchEvent,
  resetMatchEventsByFixture
} from '../controllers/matchEvent/matchEventController';

const router = Router();

// Public routes
router.get('/fixture/:fixtureId', getMatchEventsByFixture as RequestHandler);

// Protected routes
router.post('/create', authenticate as RequestHandler, createMatchEvent as RequestHandler);
router.delete('/deletemany/:id', authenticate as RequestHandler, deleteMatchEvent as RequestHandler);
router.delete('/reset/:fixtureId', authenticate as RequestHandler, resetMatchEventsByFixture as RequestHandler);

export default router;