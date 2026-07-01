import express from 'express';
import { getSearchHistory } from '../controllers/history.controller.js';
import protect from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected — only logged-in users have search history
router.get('/', protect, getSearchHistory);

export default router;
