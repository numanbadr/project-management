import type { Project, Task, Subtask, Note } from '@/types';
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
} from 'date-fns';

function d(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

const today = new Date();

export function createMockData(): {
  projects: Record<string, Project>;
  tasks: Record<string, Task>;
  subtasks: Record<string, Subtask>;
  notes: Record<string, Note>;
} {
  const projects: Record<string, Project> = {};
  const tasks: Record<string, Task> = {};
  const subtasks: Record<string, Subtask> = {};
  const notes: Record<string, Note> = {};

  // --- Project 1: CCTV Detection (KRA) - has delayed and on-schedule tasks ---
  const p1: Project = {
    id: 'p1',
    name: 'CCTV Detection System',
    classification: 'KRA',
    color: '#3b82f6',
    scheduledStart: d(subWeeks(today, 8)),
    scheduledEnd: d(addWeeks(today, 8)),
    actualStart: d(subWeeks(today, 8)),
    actualEnd: null,
    isExpanded: true,
    sortOrder: 0,
  };
  projects[p1.id] = p1;

  const t1_1: Task = {
    id: 't1_1',
    projectId: 'p1',
    name: 'Requirement Gathering',
    scheduledStart: d(subWeeks(today, 8)),
    scheduledEnd: d(subWeeks(today, 6)),
    actualStart: d(subWeeks(today, 8)),
    actualEnd: d(subWeeks(today, 5)), // delayed by 1 week
    isExpanded: false,
    sortOrder: 0,
  };
  tasks[t1_1.id] = t1_1;

  const t1_2: Task = {
    id: 't1_2',
    projectId: 'p1',
    name: 'Model Training',
    scheduledStart: d(subWeeks(today, 5)),
    scheduledEnd: d(subWeeks(today, 2)),
    actualStart: d(subWeeks(today, 5)),
    actualEnd: d(subWeeks(today, 3)), // completed early by 1 week
    isExpanded: true,
    sortOrder: 1,
  };
  tasks[t1_2.id] = t1_2;

  // Subtasks for Model Training
  const s1_2_1: Subtask = {
    id: 's1_2_1',
    taskId: 't1_2',
    projectId: 'p1',
    name: 'Prepare training dataset',
    scheduledStart: d(subWeeks(today, 5)),
    scheduledEnd: d(subWeeks(today, 4)),
    actualStart: d(subWeeks(today, 5)),
    actualEnd: d(subWeeks(today, 4)),
    priority: 'Urgent',
    sortOrder: 0,
  };
  subtasks[s1_2_1.id] = s1_2_1;

  const s1_2_2: Subtask = {
    id: 's1_2_2',
    taskId: 't1_2',
    projectId: 'p1',
    name: 'Train YOLOv8 model',
    scheduledStart: d(subWeeks(today, 4)),
    scheduledEnd: d(subWeeks(today, 3)),
    actualStart: d(subWeeks(today, 4)),
    actualEnd: d(subWeeks(today, 3)),
    priority: 'Important',
    sortOrder: 1,
  };
  subtasks[s1_2_2.id] = s1_2_2;

  const t1_3: Task = {
    id: 't1_3',
    projectId: 'p1',
    name: 'Module 1 - Live Feed',
    scheduledStart: d(subWeeks(today, 2)),
    scheduledEnd: d(addWeeks(today, 2)),
    actualStart: d(subWeeks(today, 2)),
    actualEnd: null, // in progress
    isExpanded: false,
    sortOrder: 2,
  };
  tasks[t1_3.id] = t1_3;

  const t1_4: Task = {
    id: 't1_4',
    projectId: 'p1',
    name: 'Module 2 - Alert System',
    scheduledStart: d(addWeeks(today, 1)),
    scheduledEnd: d(addWeeks(today, 5)),
    actualStart: null,
    actualEnd: null, // not started
    isExpanded: false,
    sortOrder: 3,
  };
  tasks[t1_4.id] = t1_4;

  const t1_5: Task = {
    id: 't1_5',
    projectId: 'p1',
    name: 'Testing & Go Live',
    scheduledStart: d(addWeeks(today, 5)),
    scheduledEnd: d(addWeeks(today, 8)),
    actualStart: null,
    actualEnd: null,
    isExpanded: false,
    sortOrder: 4,
  };
  tasks[t1_5.id] = t1_5;

  // --- Project 2: Office Network Upgrade (Service Request) - mostly on schedule ---
  const p2: Project = {
    id: 'p2',
    name: 'Office Network Upgrade',
    classification: 'Service Request',
    color: '#22c55e',
    scheduledStart: d(subWeeks(today, 3)),
    scheduledEnd: d(addWeeks(today, 4)),
    actualStart: d(subWeeks(today, 3)),
    actualEnd: null,
    isExpanded: true,
    sortOrder: 1,
  };
  projects[p2.id] = p2;

  const t2_1: Task = {
    id: 't2_1',
    projectId: 'p2',
    name: 'Site Survey',
    scheduledStart: d(subWeeks(today, 3)),
    scheduledEnd: d(subWeeks(today, 2)),
    actualStart: d(subWeeks(today, 3)),
    actualEnd: d(subWeeks(today, 2)),
    isExpanded: false,
    sortOrder: 0,
  };
  tasks[t2_1.id] = t2_1;

  const t2_2: Task = {
    id: 't2_2',
    projectId: 'p2',
    name: 'Equipment Procurement',
    scheduledStart: d(subWeeks(today, 2)),
    scheduledEnd: d(subDays(today, 3)),
    actualStart: d(subWeeks(today, 2)),
    actualEnd: null, // still in progress, slightly delayed
    isExpanded: false,
    sortOrder: 1,
  };
  tasks[t2_2.id] = t2_2;

  const t2_3: Task = {
    id: 't2_3',
    projectId: 'p2',
    name: 'Installation & Config',
    scheduledStart: d(addDays(today, 1)),
    scheduledEnd: d(addWeeks(today, 3)),
    actualStart: null,
    actualEnd: null,
    isExpanded: false,
    sortOrder: 2,
  };
  tasks[t2_3.id] = t2_3;

  // --- Project 3: Dashboard Redesign (Improvement) - completed early ---
  const p3: Project = {
    id: 'p3',
    name: 'Dashboard Redesign',
    classification: 'Improvement',
    color: '#f59e0b',
    scheduledStart: d(subWeeks(today, 6)),
    scheduledEnd: d(subWeeks(today, 1)),
    actualStart: d(subWeeks(today, 6)),
    actualEnd: d(subWeeks(today, 2)), // completed 1 week early
    isExpanded: false,
    sortOrder: 2,
  };
  projects[p3.id] = p3;

  const t3_1: Task = {
    id: 't3_1',
    projectId: 'p3',
    name: 'UI/UX Design',
    scheduledStart: d(subWeeks(today, 6)),
    scheduledEnd: d(subWeeks(today, 4)),
    actualStart: d(subWeeks(today, 6)),
    actualEnd: d(subWeeks(today, 4)),
    isExpanded: false,
    sortOrder: 0,
  };
  tasks[t3_1.id] = t3_1;

  const t3_2: Task = {
    id: 't3_2',
    projectId: 'p3',
    name: 'Frontend Development',
    scheduledStart: d(subWeeks(today, 4)),
    scheduledEnd: d(subWeeks(today, 1)),
    actualStart: d(subWeeks(today, 4)),
    actualEnd: d(subWeeks(today, 2)), // completed 1 week early
    isExpanded: false,
    sortOrder: 1,
  };
  tasks[t3_2.id] = t3_2;

  // --- Project 4: Server Patching (Ad Hoc) - short duration, urgent ---
  const p4: Project = {
    id: 'p4',
    name: 'Server Security Patching',
    classification: 'Ad Hoc',
    color: '#ef4444',
    scheduledStart: d(subDays(today, 2)),
    scheduledEnd: d(addDays(today, 3)),
    actualStart: d(subDays(today, 2)),
    actualEnd: null,
    isExpanded: true,
    sortOrder: 3,
  };
  projects[p4.id] = p4;

  const t4_1: Task = {
    id: 't4_1',
    projectId: 'p4',
    name: 'Backup & Snapshot',
    scheduledStart: d(subDays(today, 2)),
    scheduledEnd: d(subDays(today, 1)),
    actualStart: d(subDays(today, 2)),
    actualEnd: d(subDays(today, 1)),
    isExpanded: true,
    sortOrder: 0,
  };
  tasks[t4_1.id] = t4_1;

  const s4_1_1: Subtask = {
    id: 's4_1_1',
    taskId: 't4_1',
    projectId: 'p4',
    name: 'Create VM snapshots',
    scheduledStart: d(subDays(today, 2)),
    scheduledEnd: d(subDays(today, 1)),
    actualStart: d(subDays(today, 2)),
    actualEnd: d(subDays(today, 1)),
    priority: 'Urgent',
    sortOrder: 0,
  };
  subtasks[s4_1_1.id] = s4_1_1;

  const t4_2: Task = {
    id: 't4_2',
    projectId: 'p4',
    name: 'Apply Patches',
    scheduledStart: d(today),
    scheduledEnd: d(addDays(today, 2)),
    actualStart: d(today),
    actualEnd: null,
    isExpanded: true,
    sortOrder: 1,
  };
  tasks[t4_2.id] = t4_2;

  const s4_2_1: Subtask = {
    id: 's4_2_1',
    taskId: 't4_2',
    projectId: 'p4',
    name: 'Patch web servers',
    scheduledStart: d(today),
    scheduledEnd: d(addDays(today, 1)),
    actualStart: d(today),
    actualEnd: null,
    priority: 'Urgent',
    sortOrder: 0,
  };
  subtasks[s4_2_1.id] = s4_2_1;

  const s4_2_2: Subtask = {
    id: 's4_2_2',
    taskId: 't4_2',
    projectId: 'p4',
    name: 'Patch database servers',
    scheduledStart: d(addDays(today, 1)),
    scheduledEnd: d(addDays(today, 2)),
    actualStart: null,
    actualEnd: null,
    priority: 'Important',
    sortOrder: 1,
  };
  subtasks[s4_2_2.id] = s4_2_2;

  const t4_3: Task = {
    id: 't4_3',
    projectId: 'p4',
    name: 'Verification',
    scheduledStart: d(addDays(today, 2)),
    scheduledEnd: d(addDays(today, 3)),
    actualStart: null,
    actualEnd: null,
    isExpanded: false,
    sortOrder: 2,
  };
  tasks[t4_3.id] = t4_3;

  return { projects, tasks, subtasks, notes };
}
