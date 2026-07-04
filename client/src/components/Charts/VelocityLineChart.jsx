import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './Charts.css';

/**
 * VelocityLineChart — Issue & PR velocity line chart
 *
 * Props:
 *   issues: Array of { month: "2026-01", opened: number, closed: number }
 *   prs:    Array of { month: "2026-01", opened: number, merged: number }
 */
const VelocityLineChart = ({ issues = [], prs = [] }) => {
  if ((!issues || issues.length === 0) && (!prs || prs.length === 0)) {
    return (
      <div className="chart-no-data">
        <span className="chart-no-data-icon">📈</span>
        <p>No velocity data available</p>
      </div>
    );
  }

  // Merge issues and PRs into a single dataset keyed by month
  const monthMap = {};

  issues.forEach((item) => {
    if (!monthMap[item.month]) monthMap[item.month] = { month: item.month };
    monthMap[item.month].issuesOpened = item.opened;
    monthMap[item.month].issuesClosed = item.closed;
  });

  prs.forEach((item) => {
    if (!monthMap[item.month]) monthMap[item.month] = { month: item.month };
    monthMap[item.month].prsOpened = item.opened;
    monthMap[item.month].prsMerged = item.merged;
  });

  const chartData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      ...item,
      // Format month label: "2026-01" → "Jan"
      label: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="chart-tooltip">
        <p style={{ color: 'var(--text-bright)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color, fontFamily: 'var(--font-mono)', fontSize: 12, padding: '1px 0' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="velocity-line-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="label"
            stroke="var(--text-muted)"
            fontSize={11}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="issuesOpened"
            name="Issues Opened"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: 'var(--bg-void)' }}
          />
          <Line
            type="monotone"
            dataKey="issuesClosed"
            name="Issues Closed"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: 'var(--bg-void)' }}
          />
          <Line
            type="monotone"
            dataKey="prsOpened"
            name="PRs Opened"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: 'var(--bg-void)' }}
          />
          <Line
            type="monotone"
            dataKey="prsMerged"
            name="PRs Merged"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'var(--bg-void)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VelocityLineChart;
