export type ProjectClassification =
  | 'KRA'
  | 'Service Request'
  | 'Ad Hoc'
  | 'Improvement'
  | 'Others';

export type SubtaskPriority = 'Urgent' | 'Important' | 'Normal' | 'Low';

export type NoteType =
  | 'meeting-details'
  | 'project-requirement'
  | 'timeline'
  | 'to-do-list'
  | 'kiv'
  | 'others';

export type GanttViewMode = 'daily' | 'weekly' | 'monthly';
export type TimelineViewMode = 'day' | 'week';

export interface Project {
  id: string;
  name: string;
  classification: ProjectClassification;
  color: string;
  scheduledStart: string; // ISO 8601
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  isExpanded: boolean;
  sortOrder: number;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  isExpanded: boolean;
  sortOrder: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  projectId: string;
  name: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  priority: SubtaskPriority;
  sortOrder: number;
}

export interface Note {
  id: string;
  parentId: string;
  parentType: 'project' | 'task' | 'subtask';
  noteType: NoteType;
  title: string;
  excalidrawElements: string; // JSON string
  excalidrawAppState: string; // JSON string
  excalidrawFiles: string; // JSON string
}

export type BarSegmentType = 'on-schedule' | 'delayed' | 'early' | 'scheduled-only';

export interface BarSegment {
  startDate: string;
  endDate: string;
  type: BarSegmentType;
}

export interface GanttRow {
  id: string;
  type: 'project' | 'task' | 'subtask';
  name: string;
  depth: number;
  projectColor: string;
  classification?: ProjectClassification;
  priority?: SubtaskPriority;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  isExpanded?: boolean;
  hasChildren: boolean;
  parentId?: string;
}

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  'meeting-details': 'Meeting Details',
  'project-requirement': 'Project Requirement',
  'timeline': 'Timeline',
  'to-do-list': 'To-Do List',
  'kiv': 'KIV',
  'others': 'Others',
};

export const PRIORITY_CONFIG: Record<SubtaskPriority, { color: string; label: string }> = {
  Urgent: { color: '#ef4444', label: 'Urgent' },
  Important: { color: '#f59e0b', label: 'Important' },
  Normal: { color: '#3b82f6', label: 'Normal' },
  Low: { color: '#6b7280', label: 'Low' },
};

export const CLASSIFICATION_COLORS: Record<ProjectClassification, string> = {
  KRA: '#8b5cf6',
  'Service Request': '#06b6d4',
  'Ad Hoc': '#f97316',
  Improvement: '#22c55e',
  Others: '#6b7280',
};

export const PROJECT_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
];
