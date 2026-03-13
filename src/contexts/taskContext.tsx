import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { taskApi } from "@/lib/taskApi";
import type {
  CreateTaskInput,
  TaskFilters,
  TaskItem,
  TaskListType,
  UpdateTaskInput,
} from "@/types/task";

type TaskContextValue = {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  getTasksByFilters: (filters?: TaskFilters) => TaskItem[];
  getTasksByListType: (listType: TaskListType) => TaskItem[];
  addTask: (input: CreateTaskInput) => Promise<TaskItem>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<TaskItem>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<TaskItem>;
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const next = await taskApi.getTasks();
      setTasks(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const addTask = async (input: CreateTaskInput) => {
    const created = await taskApi.addTask(input);
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    const updated = await taskApi.updateTask(id, input);
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    return updated;
  };

  const deleteTask = async (id: string) => {
    await taskApi.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const updated = await taskApi.updateTask(id, { completed });
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    return updated;
  };

  const getTasksByFilters = (filters?: TaskFilters) => {
    if (!filters) return tasks;

    return tasks.filter((task) => {
      if (filters.listType && task.listType !== filters.listType) return false;
      if (filters.bucket && task.bucket !== filters.bucket) return false;
      if (filters.date && task.dueDate !== filters.date) return false;
      if (typeof filters.completed === "boolean" && task.completed !== filters.completed) {
        return false;
      }
      return true;
    });
  };

  const getTasksByListType = (listType: TaskListType) => {
    return tasks.filter((task) => task.listType === listType);
  };

  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      refreshTasks,
      getTasksByFilters,
      getTasksByListType,
      addTask,
      updateTask,
      deleteTask,
      toggleComplete,
    }),
    [tasks, loading, error]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used inside TaskProvider");
  }
  return context;
};
