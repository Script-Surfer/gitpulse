import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRepoAnalytics, refreshRepoAnalytics, saveRepo, removeSavedRepo, getSavedRepos } from '../../api/api.js';
import './RepoDashboard.css';

// TODO: Import and build these chart components
// import CommitHeatmap from '../../components/Charts/CommitHeatmap.jsx';
// import ContributorTable from '../../components/Charts/ContributorTable.jsx';
// import LanguagePieChart from '../../components/Charts/LanguagePieChart.jsx';
// import VelocityLineChart from '../../components/Charts/VelocityLineChart.jsx';

const RepoDashboardPage = () => {
  const { owner, name } = useParams();
  const { user } = useAuth();

  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [savedId, setSavedId] = useState(null); // null = not saved, string = savedRepo _id

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

  // TODO: Check if this repo is already saved by the user
  // useEffect(() => { if (user && repoData) { check saved status } }, [user, repoData]);

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
    // TODO: Implement save/unsave toggle
    // if (savedId) → removeSavedRepo(savedId) → setSavedId(null)
    // else → saveRepo(repoData._id) → setSavedId(result._id)
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

  if (error) {
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
                  id="save-btn"
                >
                  {savedId ? '✓ Saved' : '💾 Save to My Repos'}
                </button>
              )}

              {/* TODO: Export as PDF button */}
              {/* <button className="btn btn-secondary" id="export-btn">📄 Export PDF</button> */}
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

        {/* Charts Grid — TODO: Build these components */}
        <div className="charts-grid">

          {/* Commit Activity Heatmap */}
          <section className="chart-card glass-card animate-fade-in-up" id="commit-heatmap">
            <h2 className="chart-title">📊 Commit Activity</h2>
            <p className="chart-subtitle">Last 12 months</p>
            <div className="chart-body">
              {/* TODO: <CommitHeatmap data={repoData.commitActivity} /> */}
              <div className="chart-placeholder">
                <p>🚧 Build CommitHeatmap component here</p>
                <p className="text-muted">Use react-calendar-heatmap + repoData.commitActivity</p>
                <p className="text-muted">Data shape: [{'{'}week, total, days: [Sun..Sat]{'}'}]</p>
              </div>
            </div>
          </section>

          {/* Contributor Leaderboard */}
          <section className="chart-card glass-card animate-fade-in-up" id="contributors">
            <h2 className="chart-title">👥 Top Contributors</h2>
            <p className="chart-subtitle">By commit count</p>
            <div className="chart-body">
              {/* TODO: <ContributorTable data={repoData.contributors} /> */}
              <div className="chart-placeholder">
                <p>🚧 Build ContributorTable component here</p>
                <p className="text-muted">Data shape: [{'{'}login, avatarUrl, commits{'}'}]</p>
              </div>
            </div>
          </section>

          {/* Language Breakdown */}
          <section className="chart-card glass-card animate-fade-in-up" id="languages">
            <h2 className="chart-title">🎨 Languages</h2>
            <p className="chart-subtitle">By bytes of code</p>
            <div className="chart-body">
              {/* TODO: <LanguagePieChart data={repoData.languages} /> */}
              <div className="chart-placeholder">
                <p>🚧 Build LanguagePieChart component here</p>
                <p className="text-muted">Use recharts PieChart + repoData.languages</p>
                <p className="text-muted">Data shape: {'{'}JavaScript: 50000, ...{'}'}</p>
              </div>
            </div>
          </section>

          {/* Issue & PR Velocity */}
          <section className="chart-card glass-card animate-fade-in-up" id="velocity">
            <h2 className="chart-title">📈 Issue & PR Velocity</h2>
            <p className="chart-subtitle">Last 6 months</p>
            <div className="chart-body">
              {/* TODO: <VelocityLineChart issues={repoData.issueVelocity} prs={repoData.prVelocity} /> */}
              <div className="chart-placeholder">
                <p>🚧 Build VelocityLineChart component here</p>
                <p className="text-muted">Use recharts LineChart</p>
                <p className="text-muted">Issues: [{'{'}month, opened, closed{'}'}]</p>
                <p className="text-muted">PRs: [{'{'}month, opened, merged{'}'}]</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RepoDashboardPage;
