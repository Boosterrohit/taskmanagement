import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useBoard } from "@/contexts/boardContext";
import type { BoardTask } from "@/contexts/boardContext";
import { Plus, Trash2 } from "lucide-react";

const BoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { boards, renameBoard, addColumn, renameColumn, deleteColumn, addTask, deleteTask } = useBoard();
  const board = boards.find((b) => b.id === boardId);
  const [newName, setNewName] = useState(board?.name || "");

  React.useEffect(() => {
    if (board) setNewName(board.name);
  }, [board]);

  if (!board) {
    return <p className="text-red-500">Board not found</p>;
  }

  const handleRename = () => {
    if (newName.trim() && newName !== board.name) {
      renameBoard(board.id, newName.trim());
    }
  };

  const [showColumnDialog, setShowColumnDialog] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState("");
  const handleAddColumn = () => {
    setNewColumnTitle("");
    setShowColumnDialog(true);
  };
  const confirmAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(board.id, newColumnTitle.trim());
    }
    setShowColumnDialog(false);
  };

  const [showTaskDialog, setShowTaskDialog] = React.useState(false);
  const [taskColumn, setTaskColumn] = React.useState<string | null>(null);
  const [taskText, setTaskText] = React.useState("");
  const [taskDate, setTaskDate] = React.useState("");
  const [taskEmail, setTaskEmail] = React.useState("");

  const handleAddTask = (colId: string) => {
    setTaskColumn(colId);
    setTaskText("");
    setTaskDate("");
    setTaskEmail("");
    setShowTaskDialog(true);
  };
  const confirmAddTask = () => {
    if (!taskColumn) return;
    const text = taskText.trim();
    if (!text) return;
    const task: BoardTask = {
      id: `${Date.now()}`,
      text,
      date: taskDate,
      assigneeEmail: taskEmail,
    };
    addTask(board.id, taskColumn, task);
    setShowTaskDialog(false);
  };

  return (
    <>
      {/* add column dialog */}
      {showColumnDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-lg font-semibold mb-2">New Section</h2>
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Section title"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowColumnDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white"
                onClick={confirmAddColumn}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* add task dialog */}
      {showTaskDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-2">New Task</h2>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
              placeholder="Description"
            />
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />
            <input
              type="email"
              value={taskEmail}
              onChange={(e) => setTaskEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Assignee email"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowTaskDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white"
                onClick={confirmAddTask}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          className="text-2xl font-bold border-b border-gray-300 focus:outline-none"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((col) => (
          <div
            key={col.id}
            className="bg-white p-4 rounded-lg shadow-md w-64 flex-shrink-0"
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className="font-semibold cursor-pointer"
                onClick={() => {
                  const t = prompt("Column title", col.title);
                  if (t && t.trim()) renameColumn(board.id, col.id, t.trim());
                }}
              >
                {col.title}
              </h3>
              <Trash2
                size={14}
                className="text-gray-400 hover:text-red-500 cursor-pointer"
                onClick={() => {
                  if (confirm("Delete this section?"))
                    deleteColumn(board.id, col.id);
                }}
              />
            </div>
            <ul className="space-y-2">
              {col.tasks.map((task) => (
                <li
                  key={task.id}
                  className="bg-white p-2 rounded shadow-sm flex flex-col relative"
                >
                  <Trash2
                    size={12}
                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={() => deleteTask(board.id, col.id, task.id)}
                  />
                  <span>{task.text}</span>
                  {task.date && (
                    <span className="text-xs text-red-500">{task.date}</span>
                  )}
                  {task.assigneeEmail && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">
                        {task.assigneeEmail.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-400">
                        {task.assigneeEmail}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleAddTask(col.id)}
              className="mt-3 text-sm text-gray-500 flex items-center gap-1"
            >
              <Plus size={14} /> Add Task
            </button>
          </div>
        ))}

        <div className="w-64 flex-shrink-0 flex items-center justify-center">
          <button
            onClick={handleAddColumn}
            className="text-gray-500 flex items-center gap-1 p-3 rounded-lg hover:bg-gray-100"
          >
            <Plus size={18} /> Add section
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default BoardPage;
