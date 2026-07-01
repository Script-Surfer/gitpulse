/**
 * CommitHeatmap — GitHub-style commit activity heatmap
 *
 * TODO: Build this component using react-calendar-heatmap
 *
 * Props:
 *   data: Array of { week: timestamp, total: number, days: [Sun, Mon, Tue, Wed, Thu, Fri, Sat] }
 *
 * Implementation hints:
 *   - import CalendarHeatmap from 'react-calendar-heatmap';
 *   - import 'react-calendar-heatmap/dist/styles.css';
 *   - import { Tooltip } from 'react-tooltip';
 *   - Transform data.days into individual date entries for the heatmap
 *   - Color scale: 0 commits = empty, 1-3 = light, 4-7 = medium, 8+ = dark
 *   - Add tooltip on hover showing exact commit count per day
 */

import CalenderHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';


const CommitHeatmap = ({ data = [] }) => {
  return (
    <div className="commit-heatmap">
      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
        🚧 CommitHeatmap — implement me!
      </p>
    </div>
  );
};

export default CommitHeatmap;
