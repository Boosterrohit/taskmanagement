import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

const ensureStore = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, "[]\n", "utf8");
  }
};

export const readTasks = async () => {
  await ensureStore();
  const raw = await fs.readFile(TASKS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeTasks = async (tasks) => {
  await ensureStore();
  await fs.writeFile(TASKS_FILE, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
};
