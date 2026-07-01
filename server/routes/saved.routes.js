import express from 'express';
import { getSavedRepos, saveRepo, removeSavedRepo } from '../controllers/saved.controller.js';
import protect from '../middlewares/auth.middleware.js';

const router = express.Router();

// All saved repo routes are protected
router.get('/', protect, getSavedRepos);
router.post('/', protect, saveRepo);
router.delete('/:id', protect, removeSavedRepo);

export default router;
