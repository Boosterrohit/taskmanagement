export type TaskListType =
  | "my-day"
  | "all-tasks"
  | "calendar"
  | "personal"
  | "work"
  | "groceries";

export type TaskBucket = "today" | "tomorrow" | "upcoming" | "someday";

export type TaskSubtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type TaskItem = {
  id: string;
  title: string;
  listType: TaskListType;
  dueDate: string | null;
  completed: boolean;
  notes: string;
  subtasks: TaskSubtask[];
  bucket: TaskBucket | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskFilters = {
  listType?: TaskListType;
  bucket?: TaskBucket;
  date?: string;
  completed?: boolean;
};

export type CreateTaskInput = {
  title: string;
  listType: TaskListType;
  dueDate?: string | null;
  completed?: boolean;
  notes?: string;
  subtasks?: TaskSubtask[];
  bucket?: TaskBucket | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
