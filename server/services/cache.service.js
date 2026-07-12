import CachedRepo from '../models/cachedRepo.models.js';
import {
    fetchRepoMetadata,
    fetchCommitActivity,
    fetchContributors,
    fetchLanguages,
    fetchIssueVelocity,
    fetchPRVelocity,
} from './github.service.js';

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get repo analytics — cache-first strategy.
 *
 * 1. Check CachedRepo by fullName ("owner/name")
 * 2. If found and fetchedAt < 1 hour ago AND not forceRefresh → return cached
 * 3. Otherwise fetch all data from GitHub, upsert CachedRepo, return fresh data
 *
 * @param {string} owner - Repo owner (e.g. "facebook")
 * @param {string} name - Repo name (e.g. "react")
 * @param {boolean} forceRefresh - If true, bypass cache and re-fetch from GitHub
 * @param {string|null} userToken - Optional user-provided GitHub token for higher rate limits
 * @returns {object} Full repo analytics data
 */
export const getOrFetchRepo = async (owner, name, forceRefresh = false, userToken = null) => {
    const fullName = `${owner}/${name}`;

    // Step 1: Check cache
    if (!forceRefresh) {
        const cached = await CachedRepo.findOne({ fullName }).lean();
        if (cached) {
            const age = Date.now() - new Date(cached.fetchedAt).getTime();
            if (age < CACHE_DURATION_MS) {
                return cached;
            }
        }
    }

    // Step 2: Fetch fresh data from GitHub (all calls in parallel for speed)
    const [metadata, commitActivity, contributors, languages, issueVelocity, prVelocity] =
        await Promise.all([
            fetchRepoMetadata(owner, name, userToken),
            fetchCommitActivity(owner, name, userToken),
            fetchContributors(owner, name, userToken),
            fetchLanguages(owner, name, userToken),
            fetchIssueVelocity(owner, name, userToken),
            fetchPRVelocity(owner, name, userToken),
        ]);

    // Step 3: Upsert into CachedRepo
    const repoData = {
        owner: metadata.owner,
        name: metadata.name,
        fullName: metadata.fullName,
        ownerAvatarUrl: metadata.ownerAvatarUrl,
        description: metadata.description,
        stars: metadata.stars,
        forks: metadata.forks,
        openIssues: metadata.openIssues,
        primaryLanguage: metadata.primaryLanguage,
        license: metadata.license,
        lastUpdated: metadata.lastUpdated,
        languages,
        commitActivity,
        contributors,
        issueVelocity,
        prVelocity,
        fetchedAt: new Date(),
    };

    const cachedRepo = await CachedRepo.findOneAndUpdate(
        { fullName },
        repoData,
        { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
    );

    return cachedRepo;
};
