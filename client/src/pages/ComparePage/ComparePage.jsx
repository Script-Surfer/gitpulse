import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComparePage.css';

const ComparePage = () => {
  const navigate = useNavigate();
  const [repoA, setRepoA] = useState('');
  const [repoB, setRepoB] = useState('');
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TODO: Implement comparison logic
  // 1. Parse both inputs using the same parseRepoInput logic from HomePage
  // 2. Fetch both repos in parallel: Promise.all([getRepoAnalytics(a), getRepoAnalytics(b)])
  // 3. Set dataA and dataB, render side-by-side dashboards

  const handleCompare = async (e) => {
    e.preventDefault();
    setError('');
    // TODO: implement
    setError('Compare functionality — wire up the API calls here');
  };

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
            {loading ? <div className="spinner"></div> : 'Compare'}
          </button>
        </form>

        {/* TODO: Side-by-side comparison results */}
        {/* 
          When dataA and dataB are both loaded, render:
          <div className="compare-grid">
            <div className="compare-column">
              - Repo A header, stats, charts
            </div>
            <div className="compare-column">
              - Repo B header, stats, charts
            </div>
          </div>
        */}
      </div>
    </div>
  );
};

export default ComparePage;
