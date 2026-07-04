import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRepoAnalytics, refreshRepoAnalytics, saveRepo, removeSavedRepo, getSavedRepos } from '../../api/api.js';
import CommitHeatmap from '../../components/Charts/CommitHeatmap.jsx';
import ContributorTable from '../../components/Charts/ContributorTable.jsx';
import LanguagePieChart from '../../components/Charts/LanguagePieChart.jsx';
import VelocityLineChart from '../../components/Charts/VelocityLineChart.jsx';
import './RepoDashboard.css';

const RepoDashboardPage = () => {
  const { owner, name } = useParams();
  const { user } = useAuth();

  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [savedId, setSavedId] = useState(null); // null = not saved, string = savedRepo _id
  const [saving, setSaving] = useState(false);

  // Fetch repo data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getRepoAnalytics(owner, name);
        setRepoData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load repository data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [owner, name]);

  // Check if this repo is already saved by the user
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user || !repoData) return;
      try {
        const { data: savedRepos } = await getSavedRepos();
        const match = savedRepos.find(
          (s) => s.cachedRepoId && s.cachedRepoId.fullName === `${owner}/${name}`
        );
        if (match) {
          setSavedId(match._id);
        } else {
          setSavedId(null);
        }
      } catch {
        // Silently fail — not critical
      }
    };
    checkSavedStatus();
  }, [user, repoData, owner, name]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await refreshRepoAnalytics(owner, name);
      setRepoData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user || !repoData) return;
    setSaving(true);
    try {
      if (savedId) {
        await removeSavedRepo(savedId);
        setSavedId(null);
      } else {
        const { data } = await saveRepo(repoData._id);
        setSavedId(data._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update save status');
    } finally {
      setSaving(false);
    }
  };

  // Convert languages Map (from Mongoose) to plain object if needed
  const getLanguagesObject = () => {
    if (!repoData?.languages) return {};
    // Mongoose Map comes as object — handle both cases
    if (repoData.languages instanceof Map) {
      return Object.fromEntries(repoData.languages);
    }
    if (typeof repoData.languages === 'object' && repoData.languages !== null) {
      // If it's a Mongoose Map serialized as JSON, it might have $__ keys
      // or it might be a plain object — just return it
      return repoData.languages;
    }
    return {};
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <div className="spinner spinner-lg"></div>
          <p>Analysing {owner}/{name}...</p>
        </div>
      </div>
    );
  }

  if (error && !repoData) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Repo Header */}
        <section className="repo-header glass-card animate-fade-in-up" id="repo-header">
          <div className="repo-header-top">
            <div className="repo-identity">
              {repoData.ownerAvatarUrl && (
                <img
                  src={repoData.ownerAvatarUrl}
                  alt={`${repoData.owner} avatar`}
                  className="repo-avatar"
                />
              )}
              <div>
                <h1 className="repo-name">{repoData.fullName}</h1>
                {repoData.description && (
                  <p className="repo-description">{repoData.description}</p>
                )}
              </div>
            </div>

            <div className="repo-actions">
              <button
                className="btn btn-secondary"
                onClick={handleRefresh}
                disabled={refreshing}
                id="refresh-btn"
              >
                {refreshing ? <div className="spinner"></div> : '🔄 Refresh'}
              </button>

              {user && (
                <button
                  className={`btn ${savedId ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleSaveToggle}
                  disabled={saving}
                  id="save-btn"
                >
                  {saving ? <div className="spinner"></div> : savedId ? '✓ Saved' : '💾 Save to My Repos'}
                </button>
              )}

              <a
                href={`https://github.com/${owner}/${name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                id="github-link"
              >
                ↗ GitHub
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="repo-stats stagger-children">
            <div className="stat-item">
              <span className="stat-value">⭐ {repoData.stars?.toLocaleString()}</span>
              <span className="stat-label">Stars</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">🍴 {repoData.forks?.toLocaleString()}</span>
              <span className="stat-label">Forks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">🐛 {repoData.openIssues?.toLocaleString()}</span>
              <span className="stat-label">Open Issues</span>
            </div>
            {repoData.primaryLanguage && (
              <div className="stat-item">
                <span className="stat-value">💻 {repoData.primaryLanguage}</span>
                <span className="stat-label">Language</span>
              </div>
            )}
            {repoData.license && (
              <div className="stat-item">
                <span className="stat-value">📄 {repoData.license}</span>
                <span className="stat-label">License</span>
              </div>
            )}
          </div>
        </section>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>{error}</div>}

        {/* Charts Grid */}
        <div className="charts-grid">

          {/* Commit Activity Heatmap */}
          <section className="chart-card glass-card animate-fade-in-up" id="commit-heatmap">
            <h2 className="chart-title">📊 Commit Activity</h2>
            <p className="chart-subtitle">Last 12 months</p>
            <div className="chart-body">
              <CommitHeatmap data={repoData.commitActivity} />
            </div>
          </section>

          {/* Contributor Leaderboard */}
          <section className="chart-card glass-card animate-fade-in-up" id="contributors">
            <h2 className="chart-title">👥 Top Contributors</h2>
            <p className="chart-subtitle">By commit count</p>
            <div className="chart-body">
              <ContributorTable data={repoData.contributors} />
            </div>
          </section>

          {/* Language Breakdown */}
          <section className="chart-card glass-card animate-fade-in-up" id="languages">
            <h2 className="chart-title">🎨 Languages</h2>
            <p className="chart-subtitle">By bytes of code</p>
            <div className="chart-body">
              <LanguagePieChart data={getLanguagesObject()} />
            </div>
          </section>

          {/* Issue & PR Velocity */}
          <section className="chart-card glass-card animate-fade-in-up" id="velocity">
            <h2 className="chart-title">📈 Issue & PR Velocity</h2>
            <p className="chart-subtitle">Last 6 months</p>
            <div className="chart-body">
              <VelocityLineChart issues={repoData.issueVelocity} prs={repoData.prVelocity} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RepoDashboardPage;
