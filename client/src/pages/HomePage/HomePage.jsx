import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSearchHistory } from '../../api/api.js';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repoInput, setRepoInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Fetch recent searches on mount if user is logged in
  // useEffect(() => { if (user) { fetch history and set state } }, [user]);
  const [recentSearches, setRecentSearches] = useState([]);

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

        {/* TODO: Add feature cards section below to showcase capabilities */}
        {/* 
          Feature ideas:
          - Commit Heatmap preview
          - Contributor Leaderboard preview
          - Language Pie Chart preview
          - Compare Repos preview
        */}
      </div>
    </div>
  );
};

export default HomePage;
