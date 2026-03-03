import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GanttViewMode, TimelineViewMode } from '@/types';

interface UIStore {
  // Gantt
  ganttViewMode: GanttViewMode;
  setGanttViewMode: (mode: GanttViewMode) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;

  // Task detail modal
  selectedItemId: string | null;
  selectedItemType: 'project' | 'task' | 'subtask' | null;
  isTaskDetailOpen: boolean;
  openTaskDetail: (id: string, type: 'project' | 'task' | 'subtask') => void;
  closeTaskDetail: () => void;

  // Timeline
  timelineViewMode: TimelineViewMode;
  setTimelineViewMode: (mode: TimelineViewMode) => void;
  timelineDate: string; // ISO date for the currently viewed day/week start
  setTimelineDate: (date: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      ganttViewMode: 'weekly',
      setGanttViewMode: (mode) => set({ ganttViewMode: mode }),
      sidebarWidth: 300,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      selectedItemId: null,
      selectedItemType: null,
      isTaskDetailOpen: false,
      openTaskDetail: (id, type) =>
        set({ selectedItemId: id, selectedItemType: type, isTaskDetailOpen: true }),
      closeTaskDetail: () =>
        set({ isTaskDetailOpen: false, selectedItemId: null, selectedItemType: null }),

      timelineViewMode: 'day',
      setTimelineViewMode: (mode) => set({ timelineViewMode: mode }),
      timelineDate: new Date().toISOString().split('T')[0],
      setTimelineDate: (date) => set({ timelineDate: date }),
    }),
    {
      name: 'project-management-ui',
      partialize: (state) => ({
        ganttViewMode: state.ganttViewMode,
        sidebarWidth: state.sidebarWidth,
        timelineViewMode: state.timelineViewMode,
      }),
    }
  )
);
