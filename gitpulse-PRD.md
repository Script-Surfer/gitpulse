# GitPulse — GitHub Repo Analytics Dashboard — Product Requirements Document (PRD)

**Project Type:** Full Stack MERN Application  
**Estimated Build Time:** 45–55 hours  
**Stack:** MongoDB · Express.js · React · Node.js  
**External API:** GitHub REST API (free, no card required)  
**Version:** 1.0  
**Status:** Planning

---

## 1. Project Overview

A web tool where a developer pastes a public GitHub repository URL and instantly gets a full analytics dashboard: commit activity over time, contributor leaderboard, language breakdown, and issue/PR velocity. Users can create an account to save repos they've analysed and revisit them later without re-fetching. Two repos can be compared side by side.

---

## 2. Goals

- Let any user analyse a public GitHub repo without needing their own GitHub token
- Visualise commit activity, contributors, languages, and issue/PR velocity clearly
- Let signed-in users save and revisit previously analysed repos
- Cache GitHub API responses in MongoDB to avoid hitting rate limits repeatedly
- Allow side-by-side comparison of two repositories

---

## 3. User Roles

| Role | Description |
|------|-------------|
| Guest | Can analyse any public repo, but results aren't saved |
| Authenticated User | Can save analysed repos, view history, compare repos, export reports |

---

## 4. Pages & Features

### 4.1 Auth Pages

#### Register (`/register`)
- Fields: name, email, password, confirm password
- Password minimum 6 characters
- On success: redirect to `/`

#### Login (`/login`)
- Fields: email, password
- JWT stored in `localStorage`
- On success: redirect to `/`

#### Logout
- Clears JWT, redirects to `/login`

---

### 4.2 Home / Analyse (`/`)

The main entry point — works for both guests and logged-in users.

#### Repo Input
- Single input field: paste a GitHub repo URL or `owner/repo` shorthand
- Validates format before submitting (e.g. `facebook/react` or `https://github.com/facebook/react`)
- "Analyse" button triggers the fetch + dashboard render

#### Recent Searches (logged-in only)
- Shows last 5 repos the user has analysed, as quick-access chips
- Clicking a chip re-loads that repo's cached dashboard instantly

---

### 4.3 Repo Dashboard (`/repo/:owner/:name`)

The core feature — shown after a repo is analysed.

#### Repo Header
- Repo name, owner avatar, star count, fork count, open issues count, primary language, license, last updated date

#### Commit Activity Heatmap
- GitHub-style heatmap showing commits per day for the last 12 months
- Hover a cell to see exact commit count for that day
- Data from GitHub's `stats/commit_activity` endpoint

#### Contributor Leaderboard
- Table of top 10 contributors ranked by number of commits
- Columns: avatar, username, commit count, percentage of total commits
- Data from GitHub's `stats/contributors` endpoint

#### Language Breakdown — Pie Chart
- Pie chart of language usage by byte count
- Data from GitHub's `languages` endpoint

#### Issue & PR Velocity — Line Chart
- Two lines: issues opened/closed per month, PRs opened/merged per month, for the last 6 months
- Data from GitHub's `issues` and `pulls` search endpoints

#### Save Button (logged-in only)
- "Save to my repos" button — stores repo reference in user's saved list
- If already saved, button shows "Saved ✓" and becomes a "Remove" toggle

#### Export Button
- "Export as PDF" — generates a PDF snapshot of the dashboard

---

### 4.4 Compare (`/compare`)

- Two repo input fields side by side
- After both are analysed, dashboard splits into two columns showing the same metrics for each repo, for direct visual comparison
- Useful for "which library should I use" type decisions

---

### 4.5 My Repos (`/my-repos`) — logged-in only

- Grid of saved repo cards: name, owner avatar, star count, last analysed date
- Click a card to reload that repo's dashboard (from cache if available)
- Remove button on each card

---

### 4.6 Settings (`/settings`) — logged-in only

- Display name and email (read-only)
- Change password form
- Optional: add a personal GitHub token to raise the user's own rate limit from 60/hr to 5000/hr (stored encrypted, never displayed again after saving)

---

## 5. REST API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| GET | `/api/auth/me` | Get logged-in user info | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| PUT | `/api/auth/github-token` | Save personal GitHub token (encrypted) | Yes |

### Repo Analysis
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/repos/:owner/:name` | Get full repo analytics (cached or fresh) | No |
| GET | `/api/repos/:owner/:name/refresh` | Force re-fetch from GitHub, bypass cache | No |

### Saved Repos
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/saved` | Get user's saved repos | Yes |
| POST | `/api/saved` | Save a repo to user's list | Yes |
| DELETE | `/api/saved/:id` | Remove a saved repo | Yes |

### Search History
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/history` | Get user's last 5 searched repos | Yes |

---

## 6. Database Models

### User
```
_id, name, email, passwordHash, githubTokenEncrypted (optional), createdAt
```

### CachedRepo
```
_id, owner, name, fullName ("owner/name"),
stars, forks, openIssues, primaryLanguage, license, lastUpdated,
languages: { JavaScript: 50000, TypeScript: 20000, ... },
commitActivity: [{ week: timestamp, total: number }],
contributors: [{ login, avatarUrl, commits }],
issueVelocity: [{ month, opened, closed }],
prVelocity: [{ month, opened, merged }],
fetchedAt (timestamp — used to decide if cache is stale),
createdAt
```

### SavedRepo
```
_id, userId (ref: User), cachedRepoId (ref: CachedRepo), savedAt
```

### SearchHistory
```
_id, userId (ref: User), fullName, searchedAt
```

---

## 7. Frontend Pages & Routes

| Route | Page Component | Protected |
|-------|----------------|-----------|
| `/` | HomePage (repo input + recent searches) | No |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/repo/:owner/:name` | RepoDashboardPage | No |
| `/compare` | ComparePage | No |
| `/my-repos` | MyReposPage | Yes |
| `/settings` | SettingsPage | Yes |

---

## 8. Tech Stack & Libraries

### Backend
| Package | Purpose |
|---------|---------|
| express | HTTP server and routing |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT generation and verification |
| bcryptjs | Password hashing |
| axios | Calling the GitHub REST API |
| crypto (built-in) | Encrypting stored GitHub tokens |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |
| node-cron | Periodically refresh stale cached repo data |

### Frontend
| Package | Purpose |
|---------|---------|
| react + vite | UI framework + dev server |
| react-router-dom | Client-side routing |
| axios | HTTP client |
| recharts | Charts (pie, line) |
| react-calendar-heatmap | GitHub-style commit heatmap |

---

## 9. GitHub API Integration Details

| Data needed | GitHub endpoint | Notes |
|-------------|------------------|-------|
| Repo metadata | `GET /repos/{owner}/{repo}` | Stars, forks, language, license |
| Commit activity | `GET /repos/{owner}/{repo}/stats/commit_activity` | Returns 202 on first call — needs retry logic |
| Contributors | `GET /repos/{owner}/{repo}/stats/contributors` | Also returns 202 on first call |
| Languages | `GET /repos/{owner}/{repo}/languages` | Byte count per language |
| Issues | `GET /repos/{owner}/{repo}/issues?state=all` | Filter PRs out (issues endpoint includes PRs) |
| Pull requests | `GET /repos/{owner}/{repo}/pulls?state=all` | For PR velocity chart |

**Rate limit handling (critical):**
- Unauthenticated: 60 requests/hour per IP
- With a GitHub personal access token: 5000 requests/hour
- Backend should use a server-side token (from `.env`) for all unauthenticated guest requests, so guests don't share the same tiny 60/hr pool unnecessarily
- Always check the `X-RateLimit-Remaining` header in GitHub's response and surface a friendly error if exhausted

**Caching strategy:**
- Cache every analysed repo in MongoDB (`CachedRepo` model)
- On a repo request, check `fetchedAt` — if less than 1 hour old, serve from cache
- If older, re-fetch from GitHub and update the cache
- This is what keeps the app usable even with the 60/hr limit

---

## 10. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| Auth | Protected routes return 401 if JWT missing or expired |
| Data isolation | Users can only see/manage their own saved repos and history |
| Rate limit safety | All GitHub calls go through the cache layer first |
| Error handling | Friendly message if repo doesn't exist or is private |
| GitHub 202 handling | Commit activity / contributor stats endpoints return 202 while GitHub computes them — backend retries up to 3 times with a short delay |
| Env variables | GitHub token, JWT secret, Mongo URI all in `.env` |
| Token encryption | User-provided personal GitHub tokens encrypted with Node's `crypto` module before storing |

---

## 11. Out of Scope (v1)

- Private repository support (would require GitHub OAuth login flow)
- Organisation-level analytics (multiple repos at once)
- Real-time updates via webhooks
- Mobile app
- Team/workspace accounts
- Commit-level diff viewing
- Code quality / complexity analysis

---

## 12. Build Phases Summary

| Phase | What Gets Built | Est. Time |
|-------|------------------|-----------|
| 1 | Project setup, folder structure, DB connection, GitHub API test calls | 4–5 hrs |
| 2 | Auth — register, login, JWT, protected routes | 4–5 hrs |
| 3 | GitHub API service layer + caching system + repo metadata endpoint | 8–10 hrs |
| 4 | Commit heatmap, contributors, language chart, issue/PR velocity endpoints | 8–10 hrs |
| 5 | Frontend — Home page, repo input, repo dashboard with all charts | 10–12 hrs |
| 6 | Saved repos, search history, compare page | 8–10 hrs |
| 7 | PDF export, settings, polish, rate-limit error handling | 5–6 hrs |
| **Total** | | **47–58 hrs** |

---

## 13. Acceptance Criteria

The project is considered complete when:

- [ ] A guest can paste any public repo URL and see a full dashboard
- [ ] Commit heatmap correctly shows the last 12 months of activity
- [ ] Contributor leaderboard shows top 10 by commit count
- [ ] Language pie chart matches GitHub's own language breakdown
- [ ] Issue/PR velocity line chart shows 6 months of data
- [ ] A logged-in user can save a repo and see it in "My Repos"
- [ ] Cached data is served instead of re-hitting GitHub API within 1 hour
- [ ] Compare page shows two repos side by side correctly
- [ ] Rate limit exhaustion shows a friendly error, not a crash
- [ ] GitHub's 202 "still computing" response is retried automatically, not shown as an error
- [ ] All protected routes reject unauthenticated requests with 401
- [ ] No GitHub token or JWT secret hardcoded anywhere in the codebase

---

*PRD for GitPulse v1.0 — ready to build*
