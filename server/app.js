import crypto from "crypto";
import cors from "cors";
import express from "express";
import { readTasks, writeTasks } from "./db.js";
import { readBoards, writeBoards } from "./db-boards.js";

const app = express();

const ALLOWED_LIST_TYPES = new Set([
  "my-day",
  "all-tasks",
  "calendar",
  "personal",
  "work",
  "groceries",
]);

const ALLOWED_BUCKETS = new Set(["today", "tomorrow", "upcoming", "someday"]);

app.use(cors());
app.use(express.json());

const sanitizeTaskInput = (payload = {}, { isCreate = false } = {}) => {
  const next = {};

  if (payload.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (isCreate && !title) {
      return { error: "Task title is required." };
    }
    if (title) next.title = title;
  }

  if (payload.listType !== undefined) {
    const listType = String(payload.listType);
    if (!ALLOWED_LIST_TYPES.has(listType)) {
      return { error: "Invalid listType." };
    }
    next.listType = listType;
  }

  if (payload.bucket !== undefined) {
    if (payload.bucket === null || payload.bucket === "") {
      next.bucket = null;
    } else {
      const bucket = String(payload.bucket);
      if (!ALLOWED_BUCKETS.has(bucket)) {
        return { error: "Invalid bucket." };
      }
      next.bucket = bucket;
    }
  }

  if (payload.dueDate !== undefined) {
    if (payload.dueDate === null || payload.dueDate === "") {
      next.dueDate = null;
    } else {
      next.dueDate = String(payload.dueDate);
    }
  }

  if (payload.completed !== undefined) {
    next.completed = Boolean(payload.completed);
  }

  if (payload.notes !== undefined) {
    next.notes = String(payload.notes || "");
  }

  if (payload.subtasks !== undefined) {
    if (!Array.isArray(payload.subtasks)) {
      return { error: "subtasks must be an array." };
    }

    next.subtasks = payload.subtasks
      .map((subtask) => ({
        id: String(subtask.id || crypto.randomUUID()),
        text: String(subtask.text || "").trim(),
        completed: Boolean(subtask.completed),
      }))
      .filter((subtask) => subtask.text.length > 0);
  }

  if (isCreate) {
    if (!next.listType) {
      return { error: "listType is required." };
    }

    return {
      value: {
        id: crypto.randomUUID(),
        title: next.title,
        listType: next.listType,
        dueDate: next.dueDate ?? null,
        completed: next.completed ?? false,
        notes: next.notes ?? "",
        subtasks: next.subtasks ?? [],
        bucket: next.bucket ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  return { value: next };
};

const applyFilters = (tasks, query) => {
  let filtered = [...tasks];

  if (query.listType) {
    filtered = filtered.filter((task) => task.listType === query.listType);
  }

  if (query.bucket) {
    filtered = filtered.filter((task) => task.bucket === query.bucket);
  }

  if (query.date) {
    filtered = filtered.filter((task) => task.dueDate === query.date);
  }

  if (query.completed === "true") {
    filtered = filtered.filter((task) => task.completed === true);
  }

  if (query.completed === "false") {
    filtered = filtered.filter((task) => task.completed === false);
  }

  filtered.sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    const aDate = a.dueDate || "9999-12-31";
    const bDate = b.dueDate || "9999-12-31";
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    return b.createdAt.localeCompare(a.createdAt);
  });

  return filtered;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "taskmanagement-api" });
});

app.get("/api/tasks", async (req, res) => {
  const tasks = await readTasks();
  const filtered = applyFilters(tasks, req.query);
  res.json(filtered);
});

app.post("/api/tasks", async (req, res) => {
  const { value, error } = sanitizeTaskInput(req.body, { isCreate: true });
  if (error) {
    return res.status(400).json({ message: error });
  }

  const tasks = await readTasks();
  tasks.push(value);
  await writeTasks(tasks);
  return res.status(201).json(value);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const { value, error } = sanitizeTaskInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const tasks = await readTasks();
  const idx = tasks.findIndex((task) => task.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ message: "Task not found." });
  }

  const updatedTask = {
    ...tasks[idx],
    ...value,
    updatedAt: new Date().toISOString(),
  };

  tasks[idx] = updatedTask;
  await writeTasks(tasks);
  return res.json(updatedTask);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const tasks = await readTasks();
  const next = tasks.filter((task) => task.id !== req.params.id);

  if (next.length === tasks.length) {
    return res.status(404).json({ message: "Task not found." });
  }

  await writeTasks(next);
  return res.status(204).send();
});

/* ─────────────────────────────────────────────────────────────
   BOARD ROUTES
───────────────────────────────────────────────────────────── */

const ALLOWED_TASK_STATUSES = new Set([
  "Pending", "Urgent", "Medium", "Complete", "In Progress",
]);

// GET /api/boards
app.get("/api/boards", async (_req, res) => {
  const boards = await readBoards();
  res.json(boards);
});

// POST /api/boards
app.post("/api/boards", async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ message: "Board name required." });
  const board = { id: crypto.randomUUID(), name, columns: [] };
  const boards = await readBoards();
  boards.push(board);
  await writeBoards(boards);
  return res.status(201).json(board);
});

// PATCH /api/boards/:id — rename
app.patch("/api/boards/:id", async (req, res) => {
  const boards = await readBoards();
  const idx = boards.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Board not found." });
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ message: "Board name required." });
  boards[idx] = { ...boards[idx], name };
  await writeBoards(boards);
  return res.json(boards[idx]);
});

// DELETE /api/boards/:id
app.delete("/api/boards/:id", async (req, res) => {
  const boards = await readBoards();
  const next = boards.filter((b) => b.id !== req.params.id);
  if (next.length === boards.length) return res.status(404).json({ message: "Board not found." });
  await writeBoards(next);
  return res.json({ ok: true });
});

// POST /api/boards/:id/columns
app.post("/api/boards/:id/columns", async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ message: "Column title required." });
  const boards = await readBoards();
  const idx = boards.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Board not found." });
  boards[idx].columns.push({ id: crypto.randomUUID(), title, tasks: [] });
  await writeBoards(boards);
  return res.status(201).json(boards[idx]);
});

// PATCH /api/boards/:boardId/columns/:columnId — rename
app.patch("/api/boards/:boardId/columns/:columnId", async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ message: "Column title required." });
  const boards = await readBoards();
  const bIdx = boards.findIndex((b) => b.id === req.params.boardId);
  if (bIdx === -1) return res.status(404).json({ message: "Board not found." });
  const cIdx = boards[bIdx].columns.findIndex((c) => c.id === req.params.columnId);
  if (cIdx === -1) return res.status(404).json({ message: "Column not found." });
  boards[bIdx].columns[cIdx] = { ...boards[bIdx].columns[cIdx], title };
  await writeBoards(boards);
  return res.json(boards[bIdx]);
});

// DELETE /api/boards/:boardId/columns/:columnId
app.delete("/api/boards/:boardId/columns/:columnId", async (req, res) => {
  const boards = await readBoards();
  const bIdx = boards.findIndex((b) => b.id === req.params.boardId);
  if (bIdx === -1) return res.status(404).json({ message: "Board not found." });
  boards[bIdx].columns = boards[bIdx].columns.filter((c) => c.id !== req.params.columnId);
  await writeBoards(boards);
  return res.json(boards[bIdx]);
});

// POST /api/boards/:boardId/columns/:columnId/tasks
app.post("/api/boards/:boardId/columns/:columnId/tasks", async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ message: "Task text required." });
  const boards = await readBoards();
  const bIdx = boards.findIndex((b) => b.id === req.params.boardId);
  if (bIdx === -1) return res.status(404).json({ message: "Board not found." });
  const cIdx = boards[bIdx].columns.findIndex((c) => c.id === req.params.columnId);
  if (cIdx === -1) return res.status(404).json({ message: "Column not found." });
  const emails = Array.isArray(req.body.assigneeEmails)
    ? req.body.assigneeEmails.map((e) => String(e).trim()).filter(Boolean)
    : [];
  const task = {
    id: crypto.randomUUID(),
    text,
    date: String(req.body.date || ""),
    assigneeEmails: emails,
    status: ALLOWED_TASK_STATUSES.has(req.body.status) ? req.body.status : null,
  };
  boards[bIdx].columns[cIdx].tasks.push(task);
  await writeBoards(boards);
  return res.status(201).json(boards[bIdx]);
});

// PATCH /api/boards/:boardId/columns/:columnId/tasks/:taskId
app.patch("/api/boards/:boardId/columns/:columnId/tasks/:taskId", async (req, res) => {
  const boards = await readBoards();
  const bIdx = boards.findIndex((b) => b.id === req.params.boardId);
  if (bIdx === -1) return res.status(404).json({ message: "Board not found." });
  const cIdx = boards[bIdx].columns.findIndex((c) => c.id === req.params.columnId);
  if (cIdx === -1) return res.status(404).json({ message: "Column not found." });
  const tIdx = boards[bIdx].columns[cIdx].tasks.findIndex((t) => t.id === req.params.taskId);
  if (tIdx === -1) return res.status(404).json({ message: "Task not found." });
  const existing = boards[bIdx].columns[cIdx].tasks[tIdx];
  const updates = {};
  if (req.body.text !== undefined) updates.text = String(req.body.text || "").trim();
  if (req.body.date !== undefined) updates.date = String(req.body.date || "");
  if (req.body.assigneeEmails !== undefined) {
    updates.assigneeEmails = Array.isArray(req.body.assigneeEmails)
      ? req.body.assigneeEmails.map((e) => String(e).trim()).filter(Boolean)
      : [];
  }
  if (req.body.status !== undefined) {
    updates.status = ALLOWED_TASK_STATUSES.has(req.body.status) ? req.body.status : null;
  }
  boards[bIdx].columns[cIdx].tasks[tIdx] = { ...existing, ...updates };
  await writeBoards(boards);
  return res.json(boards[bIdx]);
});

// DELETE /api/boards/:boardId/columns/:columnId/tasks/:taskId
app.delete("/api/boards/:boardId/columns/:columnId/tasks/:taskId", async (req, res) => {
  const boards = await readBoards();
  const bIdx = boards.findIndex((b) => b.id === req.params.boardId);
  if (bIdx === -1) return res.status(404).json({ message: "Board not found." });
  const cIdx = boards[bIdx].columns.findIndex((c) => c.id === req.params.columnId);
  if (cIdx === -1) return res.status(404).json({ message: "Column not found." });
  boards[bIdx].columns[cIdx].tasks = boards[bIdx].columns[cIdx].tasks.filter(
    (t) => t.id !== req.params.taskId
  );
  await writeBoards(boards);
  return res.json(boards[bIdx]);
});

// POST /api/boards/:boardId/move-task
app.post("/api/boards/:boardId/move-task", async (req, res) => {
  const { fromColumnId, toColumnId, taskId } = req.body;
  if (!fromColumnId || !toColumnId || !taskId) {
    return res.status(400).json({ message: "fromColumnId, toColumnId, taskId required." });
  }
  const boards = await readBoards();
  const bIdx = boards.findIndex((b) => b.id === req.params.boardId);
  if (bIdx === -1) return res.status(404).json({ message: "Board not found." });
  const fromIdx = boards[bIdx].columns.findIndex((c) => c.id === fromColumnId);
  const toIdx = boards[bIdx].columns.findIndex((c) => c.id === toColumnId);
  if (fromIdx === -1 || toIdx === -1) return res.status(404).json({ message: "Column not found." });
  const taskIdx = boards[bIdx].columns[fromIdx].tasks.findIndex((t) => t.id === taskId);
  if (taskIdx === -1) return res.status(404).json({ message: "Task not found." });
  const [task] = boards[bIdx].columns[fromIdx].tasks.splice(taskIdx, 1);
  boards[bIdx].columns[toIdx].tasks.push(task);
  await writeBoards(boards);
  return res.json(boards[bIdx]);
});

export default app;
