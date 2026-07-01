/**
 * ContributorTable — Top 10 contributors ranked by commits
 *
 * TODO: Build this component
 *
 * Props:
 *   data: Array of { login: string, avatarUrl: string, commits: number }
 *
 * Implementation hints:
 *   - Render a styled table with columns: #, Avatar, Username, Commits, % of Total
 *   - Calculate total commits: data.reduce((sum, c) => sum + c.commits, 0)
 *   - Each row: rank, <img src={avatarUrl}>, login, commits, percentage bar
 *   - Add a subtle progress bar behind the percentage for visual impact
 */

const ContributorTable = ({ data = [] }) => {
  return (
    <div className="contributor-table">
      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
        🚧 ContributorTable — implement me!
      </p>
    </div>
  );
};

export default ContributorTable;
