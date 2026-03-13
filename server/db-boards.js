import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARDS_FILE = path.join(__dirname, "data", "boards.json");

export const readBoards = async () => {
  try {
    const raw = await fs.readFile(BOARDS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const writeBoards = async (boards) => {
  await fs.mkdir(path.dirname(BOARDS_FILE), { recursive: true });
  await fs.writeFile(BOARDS_FILE, JSON.stringify(boards, null, 2), "utf-8");
};
