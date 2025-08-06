import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createFixture,
  getAllFixtures,
  getFixtureById,
  updateFixture,
  deleteFixture,
  getFixturesByTournament,
  createFixtureContainer,
  getFixtureContainerById,
  getFixtureContainersByTournament,
  addSubfixtureToContainer,
  updateSubfixture,
  deleteSubfixture,
  deleteAllSubfixturesFromContainer
} from '../controllers/fixture/fixtureController';

const router = Router();

// Public routes
router.get('/all', getAllFixtures as RequestHandler);
router.get('/all/:id', getFixtureById as RequestHandler); 
router.get('/tournament/:tournamentId', getFixturesByTournament as RequestHandler);

// Protected routes
router.post('/create', authenticate as RequestHandler, createFixture as RequestHandler);
router.put('/update/:id', authenticate as RequestHandler, updateFixture as RequestHandler);
router.delete('/delete/:id', authenticate as RequestHandler, deleteFixture as RequestHandler);
router.post('/container', authenticate as RequestHandler, createFixtureContainer as RequestHandler);
router.get('/container/:id', getFixtureContainerById as RequestHandler);
router.get('/containers/tournament/:tournamentId', getFixtureContainersByTournament as RequestHandler);

// Subfixture management routes
router.post('/container/:containerId/subfixture', authenticate as RequestHandler, addSubfixtureToContainer as RequestHandler);
router.put('/subfixture/:subfixtureid', authenticate as RequestHandler, updateSubfixture as RequestHandler);
router.delete('/subfixture/:subfixtureid', authenticate as RequestHandler, deleteSubfixture as RequestHandler);
router.delete('/container/:containerId/subfixtures', authenticate as RequestHandler, deleteAllSubfixturesFromContainer as RequestHandler);

export default router;