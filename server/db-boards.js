import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.join(__dirname, "data", "boards.json");

// On Vercel the deployment filesystem is read-only; use /tmp for writes.
const isVercel = !!process.env.VERCEL;
const RUNTIME_FILE = isVercel ? "/tmp/boards.json" : SEED_FILE;

const ensureStore = async () => {
  if (isVercel) {
    try {
      await fs.access(RUNTIME_FILE);
    } catch {
      const seed = await fs.readFile(SEED_FILE, "utf-8").catch(() => "[]");
      await fs.writeFile(RUNTIME_FILE, seed, "utf-8");
    }
  }
};

export const readBoards = async () => {
  await ensureStore();
  try {
    const raw = await fs.readFile(RUNTIME_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const writeBoards = async (boards) => {
  await ensureStore();
  await fs.mkdir(path.dirname(RUNTIME_FILE), { recursive: true });
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(boards, null, 2), "utf-8");
};
