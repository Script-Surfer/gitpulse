import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import './Charts.css';

/**
 * CommitHeatmap — GitHub-style commit activity heatmap
 *
 * Props:
 *   data: Array of { week: timestamp, total: number, days: [Sun, Mon, Tue, Wed, Thu, Fri, Sat] }
 */
const CommitHeatmap = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-no-data">
        <span className="chart-no-data-icon">📊</span>
        <p>No commit activity data available</p>
      </div>
    );
  }

  // Transform weekly data into individual day entries
  const values = [];
  data.forEach((week) => {
    const weekStart = new Date(week.week * 1000);
    if (week.days) {
      week.days.forEach((count, dayIndex) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayIndex);
        values.push({
          date: date.toISOString().split('T')[0],
          count,
        });
      });
    }
  });

  // Calculate date range (last 12 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Color scale: maps commit count to CSS class
  const classForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count <= 2) return 'color-scale-1';
    if (value.count <= 5) return 'color-scale-2';
    if (value.count <= 8) return 'color-scale-3';
    return 'color-scale-4';
  };

  // Tooltip content
  const titleForValue = (value) => {
    if (!value || !value.date) return 'No data';
    const count = value.count || 0;
    const dateStr = new Date(value.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${count} commit${count !== 1 ? 's' : ''} on ${dateStr}`;
  };

  return (
    <div className="commit-heatmap">
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={classForValue}
        tooltipDataAttrs={(value) => ({
          'data-tooltip-id': 'heatmap-tip',
          'data-tooltip-content': titleForValue(value),
        })}
        showWeekdayLabels
        gutterSize={3}
      />
      <Tooltip
        id="heatmap-tip"
        className="heatmap-tooltip"
        place="top"
      />
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-legend-cell" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(16,185,129,0.2)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(16,185,129,0.4)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(16,185,129,0.65)' }} />
        <div className="heatmap-legend-cell" style={{ background: 'rgba(16,185,129,0.9)' }} />
        <span>More</span>
      </div>
    </div>
  );
};

export default CommitHeatmap;
