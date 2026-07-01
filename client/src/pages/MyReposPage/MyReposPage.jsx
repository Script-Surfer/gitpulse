import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedRepos, removeSavedRepo } from '../../api/api.js';
import './MyReposPage.css';

const MyReposPage = () => {
  const navigate = useNavigate();
  const [savedRepos, setSavedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await getSavedRepos();
        setSavedRepos(data);
      } catch (err) {
        setError('Failed to load saved repos');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeSavedRepo(id);
      setSavedRepos((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError('Failed to remove repo');
    }
  };

  const handleCardClick = (repo) => {
    const cached = repo.cachedRepoId;
    if (cached) {
      navigate(`/repo/${cached.owner}/${cached.name}`);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <div className="spinner spinner-lg"></div>
          <p>Loading saved repos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1>My Repos</h1>
          <p>Your saved repository analyses</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {savedRepos.length === 0 ? (
          <div className="empty-state animate-fade-in-up">
            <p className="empty-icon">📂</p>
            <h3>No saved repos yet</h3>
            <p>Analyse a repo and click "Save to My Repos" to see it here</p>
          </div>
        ) : (
          <div className="repos-grid stagger-children" id="saved-repos-grid">
            {savedRepos.map((repo) => {
              const cached = repo.cachedRepoId;
              if (!cached) return null;

              return (
                <div key={repo._id} className="repo-card glass-card" onClick={() => handleCardClick(repo)}>
                  <div className="repo-card-header">
                    {cached.ownerAvatarUrl && (
                      <img src={cached.ownerAvatarUrl} alt="" className="repo-card-avatar" />
                    )}
                    <div>
                      <h3 className="repo-card-name">{cached.fullName}</h3>
                      <span className="repo-card-date">
                        Saved {new Date(repo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="repo-card-stats">
                    <span>⭐ {cached.stars?.toLocaleString()}</span>
                    <span>🍴 {cached.forks?.toLocaleString()}</span>
                    {cached.primaryLanguage && <span>💻 {cached.primaryLanguage}</span>}
                  </div>

                  <button
                    className="btn btn-danger btn-sm repo-card-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemove(repo._id); }}
                    id={`remove-${repo._id}`}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReposPage;
