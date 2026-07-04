import { useState } from 'react';
import { getRepoAnalytics } from '../../api/api.js';
import LanguagePieChart from '../../components/Charts/LanguagePieChart.jsx';
import ContributorTable from '../../components/Charts/ContributorTable.jsx';
import './ComparePage.css';

const ComparePage = () => {
  const [repoA, setRepoA] = useState('');
  const [repoB, setRepoB] = useState('');
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Validates and parses the repo input.
   * Accepts: "owner/repo" or "https://github.com/owner/repo"
   */
  const parseRepoInput = (input) => {
    const trimmed = input.trim();

    // Try full URL format
    const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (urlMatch) return { owner: urlMatch[1], name: urlMatch[2].replace('.git', '') };

    // Try owner/repo shorthand
    const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
    if (shortMatch) return { owner: shortMatch[1], name: shortMatch[2] };

    return null;
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    setError('');
    setDataA(null);
    setDataB(null);

    const parsedA = parseRepoInput(repoA);
    const parsedB = parseRepoInput(repoB);

    if (!parsedA) {
      setError('Repository A: Please enter a valid GitHub repo URL or owner/repo format');
      return;
    }
    if (!parsedB) {
      setError('Repository B: Please enter a valid GitHub repo URL or owner/repo format');
      return;
    }

    setLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        getRepoAnalytics(parsedA.owner, parsedA.name),
        getRepoAnalytics(parsedB.owner, parsedB.name),
      ]);
      setDataA(resA.data);
      setDataB(resB.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch one or both repositories. Make sure they are valid public repos.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: get languages object from Mongoose Map
  const getLanguagesObject = (data) => {
    if (!data?.languages) return {};
    if (data.languages instanceof Map) return Object.fromEntries(data.languages);
    return data.languages;
  };

  // Helper: determine which repo "wins" a numeric stat
  const getWinnerClass = (valA, valB, side) => {
    if (valA === valB || valA == null || valB == null) return '';
    if (side === 'a') return valA > valB ? 'stat-winner' : '';
    return valB > valA ? 'stat-winner' : '';
  };

  // Format large numbers
  const fmt = (n) => (n != null ? n.toLocaleString() : '—');

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1>Compare Repos</h1>
          <p>Put two repositories side by side to see how they stack up</p>
        </div>

        <form onSubmit={handleCompare} className="compare-form glass-card animate-fade-in-up" id="compare-form">
          <div className="compare-inputs">
            <div className="input-group">
              <label htmlFor="repo-a">Repository A</label>
              <input
                type="text"
                id="repo-a"
                className="input"
                placeholder="facebook/react"
                value={repoA}
                onChange={(e) => setRepoA(e.target.value)}
              />
            </div>

            <span className="compare-vs">VS</span>

            <div className="input-group">
              <label htmlFor="repo-b">Repository B</label>
              <input
                type="text"
                id="repo-b"
                className="input"
                placeholder="vuejs/vue"
                value={repoB}
                onChange={(e) => setRepoB(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || !repoA.trim() || !repoB.trim()}
            id="compare-btn"
          >
            {loading ? <div className="spinner"></div> : '⚡ Compare'}
          </button>
        </form>

        {/* Side-by-side comparison results */}
        {dataA && dataB && (
          <div className="compare-results animate-fade-in-up">

            {/* Repo Headers */}
            <div className="compare-grid">
              <div className="compare-column">
                <div className="compare-repo-header glass-card">
                  <div className="compare-repo-identity">
                    {dataA.ownerAvatarUrl && (
                      <img src={dataA.ownerAvatarUrl} alt="" className="compare-repo-avatar" />
                    )}
                    <div>
                      <h3 className="compare-repo-name">{dataA.fullName}</h3>
                      {dataA.description && (
                        <p className="compare-repo-desc">{dataA.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-column">
                <div className="compare-repo-header glass-card">
                  <div className="compare-repo-identity">
                    {dataB.ownerAvatarUrl && (
                      <img src={dataB.ownerAvatarUrl} alt="" className="compare-repo-avatar" />
                    )}
                    <div>
                      <h3 className="compare-repo-name">{dataB.fullName}</h3>
                      {dataB.description && (
                        <p className="compare-repo-desc">{dataB.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Comparison */}
            <div className="compare-stats-card glass-card">
              <h3 className="compare-section-title">📊 Stats Comparison</h3>
              <div className="compare-stats-table">
                <div className="compare-stat-row">
                  <span className={`compare-stat-val ${getWinnerClass(dataA.stars, dataB.stars, 'a')}`}>
                    ⭐ {fmt(dataA.stars)}
                  </span>
                  <span className="compare-stat-label">Stars</span>
                  <span className={`compare-stat-val ${getWinnerClass(dataA.stars, dataB.stars, 'b')}`}>
                    ⭐ {fmt(dataB.stars)}
                  </span>
                </div>
                <div className="compare-stat-row">
                  <span className={`compare-stat-val ${getWinnerClass(dataA.forks, dataB.forks, 'a')}`}>
                    🍴 {fmt(dataA.forks)}
                  </span>
                  <span className="compare-stat-label">Forks</span>
                  <span className={`compare-stat-val ${getWinnerClass(dataA.forks, dataB.forks, 'b')}`}>
                    🍴 {fmt(dataB.forks)}
                  </span>
                </div>
                <div className="compare-stat-row">
                  <span className={`compare-stat-val ${getWinnerClass(dataB.openIssues, dataA.openIssues, 'a')}`}>
                    🐛 {fmt(dataA.openIssues)}
                  </span>
                  <span className="compare-stat-label">Open Issues</span>
                  <span className={`compare-stat-val ${getWinnerClass(dataA.openIssues, dataB.openIssues, 'a')}`}>
                    🐛 {fmt(dataB.openIssues)}
                  </span>
                </div>
                <div className="compare-stat-row">
                  <span className="compare-stat-val">
                    💻 {dataA.primaryLanguage || '—'}
                  </span>
                  <span className="compare-stat-label">Language</span>
                  <span className="compare-stat-val">
                    💻 {dataB.primaryLanguage || '—'}
                  </span>
                </div>
                <div className="compare-stat-row">
                  <span className="compare-stat-val">
                    📄 {dataA.license || '—'}
                  </span>
                  <span className="compare-stat-label">License</span>
                  <span className="compare-stat-val">
                    📄 {dataB.license || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Language Breakdown Side-by-Side */}
            <div className="compare-grid">
              <div className="compare-column">
                <div className="compare-chart-card glass-card">
                  <h3 className="compare-section-title">🎨 Languages — {dataA.fullName?.split('/')[1]}</h3>
                  <LanguagePieChart data={getLanguagesObject(dataA)} />
                </div>
              </div>
              <div className="compare-column">
                <div className="compare-chart-card glass-card">
                  <h3 className="compare-section-title">🎨 Languages — {dataB.fullName?.split('/')[1]}</h3>
                  <LanguagePieChart data={getLanguagesObject(dataB)} />
                </div>
              </div>
            </div>

            {/* Contributors Side-by-Side */}
            <div className="compare-grid">
              <div className="compare-column">
                <div className="compare-chart-card glass-card">
                  <h3 className="compare-section-title">👥 Contributors — {dataA.fullName?.split('/')[1]}</h3>
                  <ContributorTable data={dataA.contributors} />
                </div>
              </div>
              <div className="compare-column">
                <div className="compare-chart-card glass-card">
                  <h3 className="compare-section-title">👥 Contributors — {dataB.fullName?.split('/')[1]}</h3>
                  <ContributorTable data={dataB.contributors} />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
