import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type BoardTask = {
  id: string;
  text: string;
  date?: string;
  assigneeEmails?: string[];
  status?: "Pending" | "Urgent" | "Medium" | "Complete" | "In Progress";
};

export type BoardColumn = {
  id: string;
  title: string;
  tasks: BoardTask[];
};

export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
};

const API = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

interface BoardContextType {
  boards: Board[];
  loading: boolean;
  addBoard: (name: string) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  renameBoard: (id: string, name: string) => Promise<void>;
  addColumn: (boardId: string, title: string) => Promise<void>;
  renameColumn: (boardId: string, columnId: string, title: string) => Promise<void>;
  deleteColumn: (boardId: string, columnId: string) => Promise<void>;
  addTask: (boardId: string, columnId: string, task: Omit<BoardTask, "id">) => Promise<void>;
  updateTask: (boardId: string, columnId: string, taskId: string, updates: Partial<Omit<BoardTask, "id">>) => Promise<void>;
  deleteTask: (boardId: string, columnId: string, taskId: string) => Promise<void>;
  moveTask: (boardId: string, fromColumnId: string, toColumnId: string, taskId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: React.ReactNode }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/boards`);
      const data = await res.json();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const addBoard = async (name: string): Promise<Board> => {
    const res = await fetch(`${API}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const board: Board = await res.json();
    setBoards((prev) => [...prev, board]);
    return board;
  };

  const deleteBoard = async (id: string) => {
    await fetch(`${API}/boards/${id}`, {
      method: "DELETE",
    });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  const renameBoard = async (id: string, name: string) => {
    const res = await fetch(`${API}/boards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const updated: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const addColumn = async (boardId: string, title: string) => {
    const res = await fetch(`${API}/boards/${boardId}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  const renameColumn = async (boardId: string, columnId: string, title: string) => {
    const res = await fetch(`${API}/boards/${boardId}/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  const deleteColumn = async (boardId: string, columnId: string) => {
    const res = await fetch(`${API}/boards/${boardId}/columns/${columnId}`, {
      method: "DELETE",
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  const addTask = async (boardId: string, columnId: string, task: Omit<BoardTask, "id">) => {
    const res = await fetch(`${API}/boards/${boardId}/columns/${columnId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  const updateTask = async (
    boardId: string,
    columnId: string,
    taskId: string,
    updates: Partial<Omit<BoardTask, "id">>
  ) => {
    const res = await fetch(`${API}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  const deleteTask = async (boardId: string, columnId: string, taskId: string) => {
    const res = await fetch(`${API}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
      method: "DELETE",
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  const moveTask = async (
    boardId: string,
    fromColumnId: string,
    toColumnId: string,
    taskId: string
  ) => {
    const res = await fetch(`${API}/boards/${boardId}/move-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromColumnId, toColumnId, taskId }),
    });
    const updatedBoard: Board = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        loading,
        addBoard,
        deleteBoard,
        renameBoard,
        addColumn,
        renameColumn,
        deleteColumn,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = (): BoardContextType => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
};

