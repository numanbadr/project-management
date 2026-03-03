import { computeBarSegments } from '@/utils/gantt';
import { dateToX, ROW_HEIGHT } from '@/utils/date';
import type { GanttRow, GanttViewMode } from '@/types';

interface GanttBarProps {
  row: GanttRow;
  rowIndex: number;
  timelineStart: Date;
  viewMode: GanttViewMode;
  onClick: () => void;
}

const BAR_HEIGHT = 24;
const BAR_PADDING = (ROW_HEIGHT - BAR_HEIGHT) / 2;

function getFill(type: string, projectColor: string): string {
  switch (type) {
    case 'delayed':
      return 'url(#pattern-delayed)';
    case 'early':
      return 'url(#pattern-early)';
    case 'scheduled-only':
      return 'url(#pattern-scheduled)';
    case 'on-schedule':
    default:
      return projectColor;
  }
}

function getStroke(type: string, projectColor: string): string {
  switch (type) {
    case 'delayed':
      return '#ef4444';
    case 'early':
      return '#22c55e';
    case 'scheduled-only':
      return '#94a3b8';
    default:
      return projectColor;
  }
}

export function GanttBar({ row, rowIndex, timelineStart, viewMode, onClick }: GanttBarProps) {
  const segments = computeBarSegments(
    row.scheduledStart,
    row.scheduledEnd,
    row.actualStart,
    row.actualEnd
  );

  const y = rowIndex * ROW_HEIGHT + BAR_PADDING;

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      {segments.map((seg, i) => {
        const x = dateToX(seg.startDate, timelineStart, viewMode);
        const xEnd = dateToX(seg.endDate, timelineStart, viewMode);
        const width = Math.max(xEnd - x, 2);

        const isFirst = i === 0;
        const isLast = i === segments.length - 1;

        return (
          <rect
            key={`${row.id}-seg-${i}`}
            x={x}
            y={y}
            width={width}
            height={BAR_HEIGHT}
            fill={getFill(seg.type, row.projectColor)}
            stroke={getStroke(seg.type, row.projectColor)}
            strokeWidth={1}
            rx={isFirst || isLast ? 4 : 0}
            ry={isFirst || isLast ? 4 : 0}
          />
        );
      })}
      {/* Hover overlay */}
      <rect
        x={dateToX(segments[0].startDate, timelineStart, viewMode)}
        y={y}
        width={Math.max(
          dateToX(segments[segments.length - 1].endDate, timelineStart, viewMode) -
            dateToX(segments[0].startDate, timelineStart, viewMode),
          2
        )}
        height={BAR_HEIGHT}
        fill="transparent"
        className="hover:fill-black/5"
        rx={4}
      />
    </g>
  );
}
