import express from 'express';
import { Request, Response, RequestHandler, Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByTournament
} from '../controllers/post/postController';

import { authenticate } from '../middlewares/authMiddleware';
const router = express.Router();

// Basic CRUD routes
router.get('/getallposts', getAllPosts as RequestHandler);
router.get('/getallposts/:id', getPostById as RequestHandler);
router.post('/createpost',authenticate as RequestHandler, createPost as RequestHandler);
router.put('/updatepost/:id', authenticate as RequestHandler,updatePost as RequestHandler);
router.delete('/deletepost/:id', authenticate as RequestHandler,deletePost as RequestHandler);

// Additional routes
router.get('/tournament/:tournamentId', authenticate as RequestHandler, getPostsByTournament as RequestHandler);

export default router;