import React, { createContext, useContext, useState } from "react";

export type BoardTask = {
  id: string;
  text: string;
  date?: string;
  assigneeEmail?: string;
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

interface BoardContextType {
  boards: Board[];
  addBoard: (name: string) => Board;
  renameBoard: (id: string, name: string) => void;
  addColumn: (boardId: string, title: string) => void;
  renameColumn: (boardId: string, columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addTask: (boardId: string, columnId: string, task: BoardTask) => void;
  deleteTask: (boardId: string, columnId: string, taskId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: React.ReactNode }) => {
  const [boards, setBoards] = useState<Board[]>([]);

  const addBoard = (name: string) => {
    const newBoard: Board = { id: `${Date.now()}`, name, columns: [] };
    setBoards((prev) => [...prev, newBoard]);
    return newBoard;
  };

  const renameBoard = (id: string, name: string) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name } : b))
    );
  };

  const addColumn = (boardId: string, title: string) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? {
              ...b,
              columns: [...b.columns, { id: `${Date.now()}`, title, tasks: [] }],
            }
          : b
      )
    );
  };

  const renameColumn = (boardId: string, columnId: string, title: string) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) =>
            c.id === columnId ? { ...c, title } : c
          ),
        };
      })
    );
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, columns: b.columns.filter((c) => c.id !== columnId) }
          : b
      )
    );
  };

  const addTask = (
    boardId: string,
    columnId: string,
    task: BoardTask
  ) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) =>
            c.id === columnId
              ? { ...c, tasks: [...c.tasks, task] }
              : c
          ),
        };
      })
    );
  };

  const deleteTask = (
    boardId: string,
    columnId: string,
    taskId: string
  ) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) =>
            c.id === columnId
              ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
              : c
          ),
        };
      })
    );
  };

  return (
    <BoardContext.Provider
      value={{ boards, addBoard, renameBoard, addColumn, renameColumn, deleteColumn, addTask, deleteTask }}
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
