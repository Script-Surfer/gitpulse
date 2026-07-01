/**
 * LanguagePieChart — Language breakdown pie chart
 *
 * TODO: Build this component using recharts
 *
 * Props:
 *   data: Object like { JavaScript: 50000, TypeScript: 20000, CSS: 8000 }
 *
 * Implementation hints:
 *   - import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
 *   - Transform data object into array: Object.entries(data).map(([name, value]) => ({ name, value }))
 *   - Use a curated color palette for the cells:
 *     const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
 *   - Show percentage labels on each slice
 *   - Use ResponsiveContainer for responsive sizing
 */

const LanguagePieChart = ({ data = {} }) => {
  return (
    <div className="language-pie-chart">
      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
        🚧 LanguagePieChart — implement me!
      </p>
    </div>
  );
};

export default LanguagePieChart;
