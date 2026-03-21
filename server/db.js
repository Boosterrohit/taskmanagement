import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.join(__dirname, "data", "tasks.json");

// On Vercel the deployment filesystem is read-only; use /tmp for writes.
const isVercel = !!process.env.VERCEL;
const RUNTIME_FILE = isVercel ? "/tmp/tasks.json" : SEED_FILE;

const ensureStore = async () => {
  if (isVercel) {
    // Copy seed data to /tmp on cold start if not already there.
    try {
      await fs.access(RUNTIME_FILE);
    } catch {
      const seed = await fs.readFile(SEED_FILE, "utf8").catch(() => "[]\n");
      await fs.writeFile(RUNTIME_FILE, seed, "utf8");
    }
  } else {
    await fs.mkdir(path.dirname(RUNTIME_FILE), { recursive: true });
    try {
      await fs.access(RUNTIME_FILE);
    } catch {
      await fs.writeFile(RUNTIME_FILE, "[]\n", "utf8");
    }
  }
};

export const readTasks = async () => {
  await ensureStore();
  const raw = await fs.readFile(RUNTIME_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeTasks = async (tasks) => {
  await ensureStore();
  await fs.writeFile(RUNTIME_FILE, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
};
