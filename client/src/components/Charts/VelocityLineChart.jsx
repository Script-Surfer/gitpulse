/**
 * VelocityLineChart — Issue & PR velocity line chart
 *
 * TODO: Build this component using recharts
 *
 * Props:
 *   issues: Array of { month: "2026-01", opened: number, closed: number }
 *   prs:    Array of { month: "2026-01", opened: number, merged: number }
 *
 * Implementation hints:
 *   - import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
 *   - Merge issues and PRs into a single dataset keyed by month:
 *     [{ month, issuesOpened, issuesClosed, prsOpened, prsMerged }]
 *   - Use 4 lines with different colors:
 *     Issues Opened: '#6366f1', Issues Closed: '#06b6d4'
 *     PRs Opened: '#f59e0b', PRs Merged: '#10b981'
 *   - Use strokeWidth={2}, dot={{ r: 4 }} for clean line styling
 *   - Use ResponsiveContainer for responsive sizing
 */

const VelocityLineChart = ({ issues = [], prs = [] }) => {
  return (
    <div className="velocity-line-chart">
      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
        🚧 VelocityLineChart — implement me!
      </p>
    </div>
  );
};

export default VelocityLineChart;
