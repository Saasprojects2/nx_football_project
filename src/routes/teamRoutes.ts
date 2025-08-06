import { RequestHandler, Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addPlayersToTeam,
  removePlayersFromTeam,
  getMyTeams,
  getPlayerTeams,
} from '../controllers/team/teamController';

const router = Router();

// Public routes
router.get('/all', getAllTeams as RequestHandler);
router.get('/all/:id', getTeamById as RequestHandler);

// Protected routes
router.post('/create', authenticate as RequestHandler , createTeam as RequestHandler);
router.put('/update/:id', authenticate as RequestHandler, updateTeam as RequestHandler);
router.delete('/delete/:id', authenticate as RequestHandler, deleteTeam as RequestHandler);
router.post('/add-player', authenticate as RequestHandler, addPlayersToTeam as RequestHandler);
router.delete('/remove-player/:teamId/players/:playerId', authenticate as RequestHandler, removePlayersFromTeam as RequestHandler);
router.get('/user/my-teams', authenticate as RequestHandler, getMyTeams as RequestHandler);
router.get('/user/as-player', authenticate as RequestHandler, getPlayerTeams as RequestHandler);

export default router;