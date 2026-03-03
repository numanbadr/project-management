import type { ColumnInfo, MonthHeader } from '@/utils/date';

interface GanttHeaderProps {
  columns: ColumnInfo[];
  monthHeaders: MonthHeader[];
  totalWidth: number;
  todayX: number;
  showMonthHeaders: boolean;
}

const HEADER_HEIGHT = 56;
const MONTH_ROW_HEIGHT = 24;
const COLUMN_ROW_HEIGHT = 32;

export { HEADER_HEIGHT };

export function GanttHeader({
  columns,
  monthHeaders,
  totalWidth,
  todayX,
  showMonthHeaders,
}: GanttHeaderProps) {
  return (
    <div style={{ width: totalWidth, height: HEADER_HEIGHT }} className="relative select-none">
      <svg width={totalWidth} height={HEADER_HEIGHT}>
        {/* Month headers (for daily and weekly views) */}
        {showMonthHeaders &&
          monthHeaders.map((mh, i) => (
            <g key={`mh-${i}`}>
              <rect
                x={mh.x}
                y={0}
                width={mh.width}
                height={MONTH_ROW_HEIGHT}
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={mh.x + mh.width / 2}
                y={MONTH_ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-700 text-[11px] font-semibold"
              >
                {mh.label}
              </text>
            </g>
          ))}

        {/* Column headers */}
        {columns.map((col) => {
          const yOffset = showMonthHeaders ? MONTH_ROW_HEIGHT : 0;
          return (
            <g key={`col-${col.x}`}>
              <rect
                x={col.x}
                y={yOffset}
                width={col.width}
                height={COLUMN_ROW_HEIGHT}
                fill={col.isToday ? '#eff6ff' : '#ffffff'}
                stroke="#e2e8f0"
                strokeWidth={0.5}
              />
              <text
                x={col.x + col.width / 2}
                y={yOffset + (col.sublabel ? 12 : COLUMN_ROW_HEIGHT / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[11px] font-medium ${
                  col.isToday ? 'fill-blue-600' : 'fill-slate-600'
                }`}
              >
                {col.label}
              </text>
              {col.sublabel && (
                <text
                  x={col.x + col.width / 2}
                  y={yOffset + 24}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[9px] ${
                    col.isToday ? 'fill-blue-400' : 'fill-slate-400'
                  }`}
                >
                  {col.sublabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Today indicator in header */}
        <line
          x1={todayX}
          y1={0}
          x2={todayX}
          y2={HEADER_HEIGHT}
          stroke="#3b82f6"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
