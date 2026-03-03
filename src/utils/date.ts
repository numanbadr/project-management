import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  getWeek,
  endOfWeek,
  differenceInDays,
  isToday,
  isSameMonth,
  parseISO,
  isWithinInterval,
  startOfDay,
  addDays,
} from 'date-fns';
import type { GanttViewMode } from '@/types';

export const WEEK_OPTIONS = { weekStartsOn: 1 as const }; // Monday start

export function getTimelineRange(): { start: Date; end: Date } {
  const today = new Date();
  return {
    start: startOfMonth(subMonths(today, 6)),
    end: endOfMonth(addMonths(today, 6)),
  };
}

export const COLUMN_WIDTHS: Record<GanttViewMode, number> = {
  daily: 40,
  weekly: 100,
  monthly: 200,
};

export const ROW_HEIGHT = 36;

export function dateToX(
  date: Date | string,
  timelineStart: Date,
  viewMode: GanttViewMode
): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const days = differenceInDays(startOfDay(d), startOfDay(timelineStart));

  switch (viewMode) {
    case 'daily':
      return days * COLUMN_WIDTHS.daily;
    case 'weekly':
      return (days / 7) * COLUMN_WIDTHS.weekly;
    case 'monthly':
      return (days / 30) * COLUMN_WIDTHS.monthly;
  }
}

export function getTotalWidth(timelineStart: Date, timelineEnd: Date, viewMode: GanttViewMode): number {
  return dateToX(timelineEnd, timelineStart, viewMode) + COLUMN_WIDTHS[viewMode];
}

export interface ColumnInfo {
  date: Date;
  label: string;
  sublabel?: string;
  x: number;
  width: number;
  isToday: boolean;
}

export interface MonthHeader {
  label: string;
  x: number;
  width: number;
}

export function getColumns(
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: GanttViewMode
): { columns: ColumnInfo[]; monthHeaders: MonthHeader[] } {
  const columns: ColumnInfo[] = [];
  const monthHeaders: MonthHeader[] = [];

  switch (viewMode) {
    case 'daily': {
      const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });
      let currentMonth = '';
      let monthStartX = 0;

      days.forEach((day, i) => {
        const x = i * COLUMN_WIDTHS.daily;
        const monthKey = format(day, 'MMM yyyy');

        if (monthKey !== currentMonth) {
          if (currentMonth) {
            monthHeaders.push({
              label: currentMonth,
              x: monthStartX,
              width: x - monthStartX,
            });
          }
          currentMonth = monthKey;
          monthStartX = x;
        }

        columns.push({
          date: day,
          label: format(day, 'd'),
          sublabel: format(day, 'EEE'),
          x,
          width: COLUMN_WIDTHS.daily,
          isToday: isToday(day),
        });
      });

      // Push last month
      if (currentMonth) {
        monthHeaders.push({
          label: currentMonth,
          x: monthStartX,
          width: columns.length * COLUMN_WIDTHS.daily - monthStartX,
        });
      }
      break;
    }

    case 'weekly': {
      const weeks = eachWeekOfInterval(
        { start: timelineStart, end: timelineEnd },
        WEEK_OPTIONS
      );
      let currentMonth = '';
      let monthStartX = 0;
      let weekInMonth = 0;

      weeks.forEach((weekStart, i) => {
        const x = i * COLUMN_WIDTHS.weekly;
        const monthKey = format(weekStart, 'MMM yyyy');

        if (monthKey !== currentMonth) {
          if (currentMonth) {
            monthHeaders.push({
              label: currentMonth,
              x: monthStartX,
              width: x - monthStartX,
            });
          }
          currentMonth = monthKey;
          monthStartX = x;
          weekInMonth = 0;
        }
        weekInMonth++;

        const wEnd = endOfWeek(weekStart, WEEK_OPTIONS);
        const todayInWeek = isWithinInterval(new Date(), { start: weekStart, end: wEnd });

        columns.push({
          date: weekStart,
          label: `W${weekInMonth}`,
          sublabel: `${format(weekStart, 'd')}-${format(wEnd, 'd')}`,
          x,
          width: COLUMN_WIDTHS.weekly,
          isToday: todayInWeek,
        });
      });

      if (currentMonth) {
        monthHeaders.push({
          label: currentMonth,
          x: monthStartX,
          width: weeks.length * COLUMN_WIDTHS.weekly - monthStartX,
        });
      }
      break;
    }

    case 'monthly': {
      const months = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });
      months.forEach((month, i) => {
        const x = i * COLUMN_WIDTHS.monthly;
        const todayInMonth = isSameMonth(new Date(), month);

        columns.push({
          date: month,
          label: format(month, 'MMM yyyy'),
          x,
          width: COLUMN_WIDTHS.monthly,
          isToday: todayInMonth,
        });
      });
      break;
    }
  }

  return { columns, monthHeaders };
}

export function getWeekLabel(date: Date): string {
  const week = getWeek(date, WEEK_OPTIONS);
  return `W${week}`;
}

export function getTodayX(timelineStart: Date, viewMode: GanttViewMode): number {
  return dateToX(new Date(), timelineStart, viewMode);
}

export function formatDateRange(start: string, end: string): string {
  return `${format(parseISO(start), 'MMM d')} - ${format(parseISO(end), 'MMM d, yyyy')}`;
}

export function isDateInRange(date: Date, start: string, end: string): boolean {
  return isWithinInterval(startOfDay(date), {
    start: startOfDay(parseISO(start)),
    end: addDays(startOfDay(parseISO(end)), 1),
  });
}
