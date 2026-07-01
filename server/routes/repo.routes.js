import express from 'express';
import { getRepoAnalytics, refreshRepoAnalytics } from '../controllers/repo.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Both routes are public, but optionally attach req.user if a valid JWT is present
// This allows recording search history and using personal GitHub tokens
router.get('/:owner/:name', optionalAuth, getRepoAnalytics);
router.get('/:owner/:name/refresh', optionalAuth, refreshRepoAnalytics);

export default router;
