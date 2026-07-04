import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSearchHistory } from '../../api/api.js';
import './HomePage.css';

const FEATURES = [
  {
    icon: '📊',
    title: 'Commit Heatmap',
    description: 'Visualise 12 months of commit activity in a GitHub-style heatmap with daily granularity.',
  },
  {
    icon: '👥',
    title: 'Contributor Leaderboard',
    description: 'See the top 10 contributors ranked by commits with percentage breakdowns.',
  },
  {
    icon: '🎨',
    title: 'Language Breakdown',
    description: 'Interactive donut chart showing the language composition by bytes of code.',
  },
  {
    icon: '⚡',
    title: 'Compare Repos',
    description: 'Put two repositories side by side to compare stats, languages, and contributors.',
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repoInput, setRepoInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Fetch recent searches on mount if user is logged in
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data } = await getSearchHistory();
        setRecentSearches(data);
      } catch {
        // Silently fail — not critical
      }
    };
    fetchHistory();
  }, [user]);

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

  const handleAnalyse = (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseRepoInput(repoInput);
    if (!parsed) {
      setError('Please enter a valid GitHub repo URL or owner/repo format');
      return;
    }

    navigate(`/repo/${parsed.owner}/${parsed.name}`);
  };

  const handleChipClick = (fullName) => {
    const [owner, name] = fullName.split('/');
    navigate(`/repo/${owner}/${name}`);
  };

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in-up" id="hero">
          <h1 className="hero-title">
            Analyse any GitHub repo<br />
            <span className="gradient-text">in seconds</span>
          </h1>
          <p className="hero-subtitle">
            Paste a repo URL and get commit heatmaps, contributor leaderboards,
            language breakdowns, and issue/PR velocity — instantly.
          </p>

          {/* Repo Input */}
          <form onSubmit={handleAnalyse} className="repo-input-form" id="repo-input-form">
            <div className="repo-input-wrapper">
              <span className="repo-input-icon">🔍</span>
              <input
                type="text"
                className="repo-input"
                placeholder="facebook/react or https://github.com/facebook/react"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                id="repo-input"
              />
              <button
                type="submit"
                className="btn btn-primary btn-lg analyse-btn"
                disabled={loading || !repoInput.trim()}
                id="analyse-btn"
              >
                {loading ? <div className="spinner"></div> : 'Analyse'}
              </button>
            </div>
            {error && <p className="alert alert-error">{error}</p>}
          </form>
        </section>

        {/* Recent Searches — logged-in only */}
        {user && recentSearches.length > 0 && (
          <section className="recent-section animate-fade-in-up" id="recent-searches">
            <h3 className="recent-title">Recent searches</h3>
            <div className="recent-chips">
              {recentSearches.map((item) => (
                <button
                  key={item._id}
                  className="chip"
                  onClick={() => handleChipClick(item.fullName)}
                >
                  {item.fullName}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Feature Cards */}
        <section className="features-section" id="features">
          <h2 className="features-heading">
            Everything you need to understand a repo
          </h2>
          <div className="features-grid stagger-children">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card glass-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
