import cron from 'node-cron';
import CachedRepo from '../models/cachedRepo.models.js';
import SavedRepo from '../models/savedRepo.models.js';
import { getOrFetchRepo } from '../services/cache.service.js';

/**
 * Periodically refresh stale cached repo data.
 * Runs every 6 hours. Only refreshes repos that:
 *   - Have been saved by at least one user (i.e. are "popular")
 *   - Have fetchedAt older than 6 hours
 *
 * This keeps saved repos fresh without burning API quota on abandoned cache entries.
 */
const startCronJobs = () => {
    // Run every 6 hours: at minute 0 of hours 0, 6, 12, 18
    cron.schedule('0 */6 * * *', async () => {
        console.log('[CRON] Starting stale cache refresh...');

        try {
            // Find all unique cachedRepoIds that users have saved
            const savedRepoIds = await SavedRepo.distinct('cachedRepoId');

            if (savedRepoIds.length === 0) {
                console.log('[CRON] No saved repos to refresh.');
                return;
            }

            const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

            // Find cached repos that are saved by users AND stale
            const staleRepos = await CachedRepo.find({
                _id: { $in: savedRepoIds },
                fetchedAt: { $lt: sixHoursAgo },
            });

            console.log(`[CRON] Found ${staleRepos.length} stale repos to refresh.`);

            for (const repo of staleRepos) {
                try {
                    await getOrFetchRepo(repo.owner, repo.name, true);
                    console.log(`[CRON] Refreshed: ${repo.fullName}`);
                } catch (error) {
                    console.error(`[CRON] Failed to refresh ${repo.fullName}:`, error.message);
                }
            }

            console.log('[CRON] Stale cache refresh complete.');
        } catch (error) {
            console.error('[CRON] Error during cache refresh:', error.message);
        }
    });

    console.log('[CRON] Scheduled stale cache refresh every 6 hours.');
};

export default startCronJobs;
