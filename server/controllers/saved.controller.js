import SavedRepo from '../models/savedRepo.models.js';

/**
 * @desc    Get user's saved repos
 * @route   GET /api/saved
 * @access  Private
 */
export const getSavedRepos = async (req, res) => {
    try {
        const savedRepos = await SavedRepo.find({ userId: req.user._id })
            .populate('cachedRepoId')
            .sort({ createdAt: -1 });

        res.json(savedRepos);
    } catch (error) {
        console.error('GetSavedRepos error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Save a repo to user's list
 * @route   POST /api/saved
 * @access  Private
 */
export const saveRepo = async (req, res) => {
    try {
        const { cachedRepoId } = req.body;

        if (!cachedRepoId) {
            return res.status(400).json({ message: 'cachedRepoId is required' });
        }

        // Check if already saved
        const existing = await SavedRepo.findOne({
            userId: req.user._id,
            cachedRepoId,
        });

        if (existing) {
            return res.status(400).json({ message: 'Repo already saved' });
        }

        const savedRepo = await SavedRepo.create({
            userId: req.user._id,
            cachedRepoId,
        });

        // Return populated version
        const populated = await SavedRepo.findById(savedRepo._id).populate('cachedRepoId');
        res.status(201).json(populated);
    } catch (error) {
        console.error('SaveRepo error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Remove a saved repo
 * @route   DELETE /api/saved/:id
 * @access  Private
 */
export const removeSavedRepo = async (req, res) => {
    try {
        const savedRepo = await SavedRepo.findById(req.params.id);

        if (!savedRepo) {
            return res.status(404).json({ message: 'Saved repo not found' });
        }

        // Ensure user owns this saved repo (data isolation per PRD)
        if (savedRepo.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to remove this repo' });
        }

        await SavedRepo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Repo removed from saved list' });
    } catch (error) {
        console.error('RemoveSavedRepo error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
