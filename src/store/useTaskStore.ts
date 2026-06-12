import { create } from 'zustand';

export interface SubtaskData {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface TaskData {
  _id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  subtasks?: SubtaskData[];
  createdAt?: string;
}

interface TaskState {
  tasks: TaskData[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<TaskData, '_id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<TaskData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      set({ tasks: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to add task');
      await get().fetchTasks();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateTask: async (id, task) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to update task');
      await get().fetchTasks();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      await get().fetchTasks();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
