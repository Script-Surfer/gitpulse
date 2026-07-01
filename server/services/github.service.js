import axios from 'axios';

/**
 * Creates an Axios instance configured with the appropriate GitHub token.
 * Uses the user's personal token if available, otherwise falls back to the server token.
 */
const createGitHubClient = (userToken = null) => {
    const token = userToken || process.env.GITHUB_SERVER_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return axios.create({
        baseURL: 'https://api.github.com',
        headers,
    });
};

/**
 * Checks the rate limit remaining from a GitHub response.
 * Throws a descriptive error if the limit is exhausted.
 */
const checkRateLimit = (response) => {
    const remaining = parseInt(response.headers['x-ratelimit-remaining'], 10);
    const resetTimestamp = parseInt(response.headers['x-ratelimit-reset'], 10);

    if (remaining !== undefined && remaining <= 0) {
        const resetDate = new Date(resetTimestamp * 1000);
        const error = new Error(`GitHub API rate limit exhausted. Resets at ${resetDate.toLocaleTimeString()}.`);
        error.statusCode = 429;
        throw error;
    }
};

/**
 * Retries a GitHub stats endpoint that returns 202 (computing).
 * GitHub's stats/commit_activity and stats/contributors endpoints return 202
 * the first time they are called while GitHub computes the data.
 * We retry up to maxRetries times with a delay between attempts.
 */
const fetchWithRetry = async (client, url, maxRetries = 3, delayMs = 2000) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await client.get(url);
        checkRateLimit(response);

        if (response.status === 200) {
            return response.data;
        }

        // 202 means GitHub is still computing — wait and retry
        if (response.status === 202 && attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
        }
    }

    // If we exhausted retries, return empty array rather than crashing
    console.warn(`GitHub returned 202 for ${url} after ${maxRetries} retries — returning empty data`);
    return [];
};

/**
 * Fetch basic repo metadata: stars, forks, language, license, etc.
 * GitHub endpoint: GET /repos/{owner}/{repo}
 */
export const fetchRepoMetadata = async (owner, name, userToken = null) => {
    const client = createGitHubClient(userToken);
    const response = await client.get(`/repos/${owner}/${name}`);
    checkRateLimit(response);

    const repo = response.data;
    return {
        owner: repo.owner.login,
        ownerAvatarUrl: repo.owner.avatar_url,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        primaryLanguage: repo.language,
        license: repo.license ? repo.license.spdx_id : null,
        lastUpdated: repo.updated_at,
    };
};

/**
 * Fetch commit activity for the last year (52 weeks).
 * GitHub endpoint: GET /repos/{owner}/{repo}/stats/commit_activity
 * Returns array of { week: timestamp, total: number }
 */
export const fetchCommitActivity = async (owner, name, userToken = null) => {
    const client = createGitHubClient(userToken);
    const data = await fetchWithRetry(client, `/repos/${owner}/${name}/stats/commit_activity`);

    if (!Array.isArray(data)) return [];

    return data.map((week) => ({
        week: week.week,
        total: week.total,
        days: week.days, // Array of 7 daily counts (Sun-Sat) — useful for heatmap
    }));
};

/**
 * Fetch top contributors ranked by commits.
 * GitHub endpoint: GET /repos/{owner}/{repo}/stats/contributors
 * Returns array of { login, avatarUrl, commits }
 */
export const fetchContributors = async (owner, name, userToken = null) => {
    const client = createGitHubClient(userToken);
    const data = await fetchWithRetry(client, `/repos/${owner}/${name}/stats/contributors`);

    if (!Array.isArray(data)) return [];

    // Sort by total commits descending, take top 10
    return data
        .map((contributor) => ({
            login: contributor.author.login,
            avatarUrl: contributor.author.avatar_url,
            commits: contributor.total,
        }))
        .sort((a, b) => b.commits - a.commits)
        .slice(0, 10);
};

/**
 * Fetch language breakdown (bytes per language).
 * GitHub endpoint: GET /repos/{owner}/{repo}/languages
 * Returns object like { JavaScript: 50000, TypeScript: 20000 }
 */
export const fetchLanguages = async (owner, name, userToken = null) => {
    const client = createGitHubClient(userToken);
    const response = await client.get(`/repos/${owner}/${name}/languages`);
    checkRateLimit(response);
    return response.data; // Already a plain object { lang: bytes }
};

/**
 * Fetch issue velocity — opened/closed per month for the last 6 months.
 * GitHub endpoint: GET /repos/{owner}/{repo}/issues?state=all
 * Note: GitHub's issues endpoint includes PRs — we filter them out.
 */
export const fetchIssueVelocity = async (owner, name, userToken = null) => {
    const client = createGitHubClient(userToken);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const since = sixMonthsAgo.toISOString();

    // Fetch issues (may need multiple pages for active repos)
    let allIssues = [];
    let page = 1;
    const perPage = 100;

    while (page <= 5) { // Cap at 500 issues to avoid excessive API calls
        const response = await client.get(`/repos/${owner}/${name}/issues`, {
            params: { state: 'all', since, per_page: perPage, page, sort: 'created', direction: 'desc' },
        });
        checkRateLimit(response);

        const issues = response.data.filter((issue) => !issue.pull_request); // Exclude PRs
        allIssues = allIssues.concat(issues);

        if (response.data.length < perPage) break;
        page++;
    }

    // Aggregate by month
    const monthMap = {};
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = { month: key, opened: 0, closed: 0 };
    }

    allIssues.forEach((issue) => {
        const createdMonth = issue.created_at.slice(0, 7); // "YYYY-MM"
        if (monthMap[createdMonth]) {
            monthMap[createdMonth].opened++;
        }
        if (issue.closed_at) {
            const closedMonth = issue.closed_at.slice(0, 7);
            if (monthMap[closedMonth]) {
                monthMap[closedMonth].closed++;
            }
        }
    });

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Fetch PR velocity — opened/merged per month for the last 6 months.
 * GitHub endpoint: GET /repos/{owner}/{repo}/pulls?state=all
 */
export const fetchPRVelocity = async (owner, name, userToken = null) => {
    const client = createGitHubClient(userToken);

    let allPRs = [];
    let page = 1;
    const perPage = 100;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    while (page <= 5) { // Cap at 500 PRs
        const response = await client.get(`/repos/${owner}/${name}/pulls`, {
            params: { state: 'all', per_page: perPage, page, sort: 'created', direction: 'desc' },
        });
        checkRateLimit(response);

        const prs = response.data.filter((pr) => new Date(pr.created_at) >= sixMonthsAgo);
        allPRs = allPRs.concat(prs);

        // Stop if we've gone past 6 months or exhausted results
        if (response.data.length < perPage || prs.length < response.data.length) break;
        page++;
    }

    // Aggregate by month
    const monthMap = {};
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = { month: key, opened: 0, merged: 0 };
    }

    allPRs.forEach((pr) => {
        const createdMonth = pr.created_at.slice(0, 7);
        if (monthMap[createdMonth]) {
            monthMap[createdMonth].opened++;
        }
        if (pr.merged_at) {
            const mergedMonth = pr.merged_at.slice(0, 7);
            if (monthMap[mergedMonth]) {
                monthMap[mergedMonth].merged++;
            }
        }
    });

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
};
