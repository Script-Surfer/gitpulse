import { getOrFetchRepo } from '../services/cache.service.js';
import { decryptToken } from '../utils/encryption.js';
import SearchHistory from '../models/searchHistory.models.js';

/**
 * @desc    Get full repo analytics (cached or fresh)
 * @route   GET /api/repos/:owner/:name
 * @access  Public
 */
export const getRepoAnalytics = async (req, res) => {
    try {
        const { owner, name } = req.params;

        // If user is logged in and has a personal GitHub token, use it
        let userToken = null;
        if (req.user && req.user.githubTokenEncrypted) {
            userToken = decryptToken(req.user.githubTokenEncrypted);
        }

        const repoData = await getOrFetchRepo(owner, name, false, userToken);

        // If user is logged in, record search history
        if (req.user) {
            // Upsert to avoid duplicates — just update the timestamp
            await SearchHistory.findOneAndUpdate(
                { userId: req.user._id, fullName: `${owner}/${name}` },
                { userId: req.user._id, fullName: `${owner}/${name}` },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        res.json(repoData);
    } catch (error) {
        console.error('GetRepoAnalytics error:', error.message);

        if (error.statusCode === 429) {
            return res.status(429).json({ message: error.message });
        }

        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Repository not found. Make sure it is a public repository.' });
        }

        res.status(500).json({ message: 'Failed to fetch repository data' });
    }
};

/**
 * @desc    Force re-fetch repo analytics from GitHub (bypass cache)
 * @route   GET /api/repos/:owner/:name/refresh
 * @access  Public
 */
export const refreshRepoAnalytics = async (req, res) => {
    try {
        const { owner, name } = req.params;

        let userToken = null;
        if (req.user && req.user.githubTokenEncrypted) {
            userToken = decryptToken(req.user.githubTokenEncrypted);
        }

        const repoData = await getOrFetchRepo(owner, name, true, userToken);

        res.json(repoData);
    } catch (error) {
        console.error('RefreshRepoAnalytics error:', error.message);

        if (error.statusCode === 429) {
            return res.status(429).json({ message: error.message });
        }

        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Repository not found. Make sure it is a public repository.' });
        }

        res.status(500).json({ message: 'Failed to refresh repository data' });
    }
};
