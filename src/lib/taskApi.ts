import type {
  CreateTaskInput,
  TaskFilters,
  TaskItem,
  UpdateTaskInput,
} from "@/types/task";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const toQuery = (filters?: TaskFilters) => {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.listType) params.set("listType", filters.listType);
  if (filters.bucket) params.set("bucket", filters.bucket);
  if (filters.date) params.set("date", filters.date);
  if (typeof filters.completed === "boolean") {
    params.set("completed", String(filters.completed));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const taskApi = {
  getTasks: (filters?: TaskFilters) => request<TaskItem[]>(`/tasks${toQuery(filters)}`),
  addTask: (input: CreateTaskInput) =>
    request<TaskItem>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateTask: (id: string, input: UpdateTaskInput) =>
    request<TaskItem>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};
