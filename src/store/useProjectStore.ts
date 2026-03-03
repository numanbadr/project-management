import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  Project,
  Task,
  Subtask,
  Note,
  ProjectClassification,
  SubtaskPriority,
  NoteType,
} from '@/types';
import { createMockData } from '@/utils/mock-data';

interface ProjectStore {
  projects: Record<string, Project>;
  tasks: Record<string, Task>;
  subtasks: Record<string, Subtask>;
  notes: Record<string, Note>;
  classifications: ProjectClassification[];

  // Project CRUD
  addProject: (name: string, classification: ProjectClassification, color: string, scheduledStart: string, scheduledEnd: string) => string;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  toggleProjectExpanded: (id: string) => void;

  // Task CRUD
  addTask: (projectId: string, name: string, scheduledStart: string, scheduledEnd: string) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'projectId'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskExpanded: (id: string) => void;

  // Subtask CRUD
  addSubtask: (taskId: string, name: string, scheduledStart: string, scheduledEnd: string, priority: SubtaskPriority) => string;
  updateSubtask: (id: string, updates: Partial<Omit<Subtask, 'id' | 'taskId' | 'projectId'>>) => void;
  deleteSubtask: (id: string) => void;

  // Note CRUD
  addNote: (parentId: string, parentType: 'project' | 'task' | 'subtask', noteType: NoteType, title: string) => string;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'parentId' | 'parentType'>>) => void;
  deleteNote: (id: string) => void;

  // Classification management
  addClassification: (name: string) => void;

  // Selectors
  getTasksForProject: (projectId: string) => Task[];
  getSubtasksForTask: (taskId: string) => Subtask[];
  getNotesForParent: (parentId: string) => Note[];

  // Init
  _hasInitialized: boolean;
}

const initialData = createMockData();

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: initialData.projects,
      tasks: initialData.tasks,
      subtasks: initialData.subtasks,
      notes: initialData.notes,
      classifications: ['KRA', 'Service Request', 'Ad Hoc', 'Improvement', 'Others'],
      _hasInitialized: true,

      // Project CRUD
      addProject: (name, classification, color, scheduledStart, scheduledEnd) => {
        const id = nanoid();
        const projectCount = Object.keys(get().projects).length;
        set((state) => ({
          projects: {
            ...state.projects,
            [id]: {
              id,
              name,
              classification,
              color,
              scheduledStart,
              scheduledEnd,
              actualStart: null,
              actualEnd: null,
              isExpanded: true,
              sortOrder: projectCount,
            },
          },
        }));
        return id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: {
            ...state.projects,
            [id]: { ...state.projects[id], ...updates },
          },
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = { ...state.projects };
          delete newProjects[id];

          const newTasks = { ...state.tasks };
          const newSubtasks = { ...state.subtasks };
          const newNotes = { ...state.notes };

          // Cascade: delete tasks, subtasks, and notes
          const taskIds = Object.values(state.tasks)
            .filter((t) => t.projectId === id)
            .map((t) => t.id);

          for (const taskId of taskIds) {
            // Delete subtasks of this task
            Object.values(state.subtasks)
              .filter((s) => s.taskId === taskId)
              .forEach((s) => {
                // Delete notes of this subtask
                Object.values(state.notes)
                  .filter((n) => n.parentId === s.id)
                  .forEach((n) => delete newNotes[n.id]);
                delete newSubtasks[s.id];
              });

            // Delete notes of this task
            Object.values(state.notes)
              .filter((n) => n.parentId === taskId)
              .forEach((n) => delete newNotes[n.id]);
            delete newTasks[taskId];
          }

          // Delete notes of this project
          Object.values(state.notes)
            .filter((n) => n.parentId === id)
            .forEach((n) => delete newNotes[n.id]);

          return {
            projects: newProjects,
            tasks: newTasks,
            subtasks: newSubtasks,
            notes: newNotes,
          };
        });
      },

      toggleProjectExpanded: (id) => {
        set((state) => ({
          projects: {
            ...state.projects,
            [id]: { ...state.projects[id], isExpanded: !state.projects[id].isExpanded },
          },
        }));
      },

      // Task CRUD
      addTask: (projectId, name, scheduledStart, scheduledEnd) => {
        const id = nanoid();
        const taskCount = Object.values(get().tasks).filter(
          (t) => t.projectId === projectId
        ).length;
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: {
              id,
              projectId,
              name,
              scheduledStart,
              scheduledEnd,
              actualStart: null,
              actualEnd: null,
              isExpanded: false,
              sortOrder: taskCount,
            },
          },
        }));
        return id;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: { ...state.tasks[id], ...updates },
          },
        }));
      },

      deleteTask: (id) => {
        set((state) => {
          const newTasks = { ...state.tasks };
          delete newTasks[id];

          const newSubtasks = { ...state.subtasks };
          const newNotes = { ...state.notes };

          // Cascade: delete subtasks and notes
          Object.values(state.subtasks)
            .filter((s) => s.taskId === id)
            .forEach((s) => {
              Object.values(state.notes)
                .filter((n) => n.parentId === s.id)
                .forEach((n) => delete newNotes[n.id]);
              delete newSubtasks[s.id];
            });

          Object.values(state.notes)
            .filter((n) => n.parentId === id)
            .forEach((n) => delete newNotes[n.id]);

          return { tasks: newTasks, subtasks: newSubtasks, notes: newNotes };
        });
      },

      toggleTaskExpanded: (id) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: { ...state.tasks[id], isExpanded: !state.tasks[id].isExpanded },
          },
        }));
      },

      // Subtask CRUD
      addSubtask: (taskId, name, scheduledStart, scheduledEnd, priority) => {
        const id = nanoid();
        const task = get().tasks[taskId];
        const subtaskCount = Object.values(get().subtasks).filter(
          (s) => s.taskId === taskId
        ).length;
        set((state) => ({
          subtasks: {
            ...state.subtasks,
            [id]: {
              id,
              taskId,
              projectId: task.projectId,
              name,
              scheduledStart,
              scheduledEnd,
              actualStart: null,
              actualEnd: null,
              priority,
              sortOrder: subtaskCount,
            },
          },
        }));
        return id;
      },

      updateSubtask: (id, updates) => {
        set((state) => ({
          subtasks: {
            ...state.subtasks,
            [id]: { ...state.subtasks[id], ...updates },
          },
        }));
      },

      deleteSubtask: (id) => {
        set((state) => {
          const newSubtasks = { ...state.subtasks };
          delete newSubtasks[id];

          const newNotes = { ...state.notes };
          Object.values(state.notes)
            .filter((n) => n.parentId === id)
            .forEach((n) => delete newNotes[n.id]);

          return { subtasks: newSubtasks, notes: newNotes };
        });
      },

      // Note CRUD
      addNote: (parentId, parentType, noteType, title) => {
        const id = nanoid();
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: {
              id,
              parentId,
              parentType,
              noteType,
              title,
              excalidrawElements: '[]',
              excalidrawAppState: '{}',
              excalidrawFiles: '{}',
            },
          },
        }));
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: { ...state.notes[id], ...updates },
          },
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const newNotes = { ...state.notes };
          delete newNotes[id];
          return { notes: newNotes };
        });
      },

      // Classification management
      addClassification: (name) => {
        set((state) => ({
          classifications: [...state.classifications, name as ProjectClassification],
        }));
      },

      // Selectors
      getTasksForProject: (projectId) => {
        return Object.values(get().tasks)
          .filter((t) => t.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getSubtasksForTask: (taskId) => {
        return Object.values(get().subtasks)
          .filter((s) => s.taskId === taskId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getNotesForParent: (parentId) => {
        return Object.values(get().notes).filter((n) => n.parentId === parentId);
      },
    }),
    {
      name: 'project-management-store',
      partialize: (state) => ({
        projects: state.projects,
        tasks: state.tasks,
        subtasks: state.subtasks,
        notes: state.notes,
        classifications: state.classifications,
      }),
    }
  )
);
