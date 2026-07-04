import './Charts.css';

/**
 * ContributorTable — Top 10 contributors ranked by commits
 *
 * Props:
 *   data: Array of { login: string, avatarUrl: string, commits: number }
 */
const ContributorTable = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-no-data">
        <span className="chart-no-data-icon">👥</span>
        <p>No contributor data available</p>
      </div>
    );
  }

  const totalCommits = data.reduce((sum, c) => sum + c.commits, 0);
  const maxCommits = data[0]?.commits || 1;

  return (
    <div className="contributor-table">
      {data.map((contributor, index) => {
        const pct = totalCommits > 0 ? ((contributor.commits / totalCommits) * 100).toFixed(1) : 0;
        const barWidth = maxCommits > 0 ? ((contributor.commits / maxCommits) * 100) : 0;

        return (
          <div key={contributor.login} className="contributor-row">
            <span className={`contributor-rank ${index < 3 ? 'top-3' : ''}`}>
              {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
            </span>

            <img
              src={contributor.avatarUrl}
              alt={contributor.login}
              className="contributor-avatar"
              loading="lazy"
            />

            <div className="contributor-info">
              <div className="contributor-login">{contributor.login}</div>
              <div className="contributor-commits">
                {contributor.commits.toLocaleString()} commits
              </div>
            </div>

            <div className="contributor-bar-wrap">
              <div
                className="contributor-bar"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <span className="contributor-pct">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

export default ContributorTable;
