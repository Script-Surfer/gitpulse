import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Charts.css';

const COLORS = [
  '#10b981', '#6366f1', '#06b6d4', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

/**
 * LanguagePieChart — Language breakdown pie chart
 *
 * Props:
 *   data: Object like { JavaScript: 50000, TypeScript: 20000, CSS: 8000 }
 */
const LanguagePieChart = ({ data = {} }) => {
  const entries = Object.entries(data);

  if (!entries || entries.length === 0) {
    return (
      <div className="chart-no-data">
        <span className="chart-no-data-icon">🎨</span>
        <p>No language data available</p>
      </div>
    );
  }

  const totalBytes = entries.reduce((sum, [, val]) => sum + val, 0);

  const chartData = entries
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Custom label renderer — show percentage on slices > 5%
  const renderLabel = ({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
    const pct = ((value / totalBytes) * 100).toFixed(1);
    if (pct < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fontFamily="var(--font-mono)"
      >
        {pct}%
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const { name, value } = payload[0];
    const pct = ((value / totalBytes) * 100).toFixed(1);
    const formatted = value >= 1000000
      ? `${(value / 1000000).toFixed(1)}MB`
      : value >= 1000
        ? `${(value / 1000).toFixed(1)}KB`
        : `${value}B`;

    return (
      <div className="chart-tooltip">
        <p style={{ color: 'var(--text-bright)', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {name}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {formatted} · {pct}%
        </p>
      </div>
    );
  };

  return (
    <div className="language-pie-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={1}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguagePieChart;
