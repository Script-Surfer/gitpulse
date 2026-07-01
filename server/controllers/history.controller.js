import SearchHistory from '../models/searchHistory.models.js';

/**
 * @desc    Get user's last 5 searched repos
 * @route   GET /api/history
 * @access  Private
 */
export const getSearchHistory = async (req, res) => {
    try {
        const history = await SearchHistory.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .limit(5);

        res.json(history);
    } catch (error) {
        console.error('GetSearchHistory error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
