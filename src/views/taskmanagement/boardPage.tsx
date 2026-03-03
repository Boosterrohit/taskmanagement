import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useBoard } from "@/contexts/boardContext";
import type { BoardTask } from "@/contexts/boardContext";
import { Plus, Trash2 } from "lucide-react";

const BoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { boards, renameBoard, addColumn, renameColumn, deleteColumn, addTask, deleteTask, moveTask } = useBoard();
  const board = boards.find((b) => b.id === boardId);

  // drag-drop state
  const dragItem = useRef<{ columnId: string; task: BoardTask } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (task: BoardTask, from: string) => {
    dragItem.current = { columnId: from, task };
  };

  const handleDrop = (to: string) => {
    if (!dragItem.current) return;
    const { columnId, task } = dragItem.current;
    if (columnId === to) return;
    moveTask(board!.id, columnId, to, task);
    dragItem.current = null;
    setDragOverCol(null);
  };
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
  const [taskEmails, setTaskEmails] = React.useState(""); // comma separated string
  const [taskStatus, setTaskStatus] = React.useState<"Pending" | "Urgent" | "Medium" | "Complete" | "In Progress" | "" >("");

  const handleAddTask = (colId: string) => {
    setTaskColumn(colId);
    setTaskText("");
    setTaskDate("");
    setTaskEmails("");
    setTaskStatus("");
    setShowTaskDialog(true);
  };
  const confirmAddTask = () => {
    if (!taskColumn) return;
    const text = taskText.trim();
    if (!text) return;
    const emails = taskEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const task: BoardTask = {
      id: `${Date.now()}`,
      text,
      date: taskDate,
      assigneeEmails: emails,
      status: taskStatus || undefined,
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
              type="text"
              value={taskEmails}
              onChange={(e) => setTaskEmails(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
              placeholder="Assignee emails (comma separated)"
            />
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value as any)}
              className="w-full border px-3 py-2 rounded mb-4"
            >
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
            </select>
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
      <div className="flex items-center gap-2 rounded-lg shadow-md border bg-white p-5">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          className="text-2xl font-bold border-b border-gray-300 focus:outline-none w-full bg-transparent"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
        {board.columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col.id)}
            className={`bg-white p-4 rounded-lg shadow-md w-64 flex-shrink-0 transition-colors duration-200 ${
              dragOverCol === col.id ? "bg-blue-50" : ""
            }`}
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
            <ul className="space-y-2 bg-transparent">
              {col.tasks.map((task) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, col.id)}
                  className="bg-white p-2 border  rounded shadow-sm flex flex-col relative"
                >
                  <Trash2
                    size={12}
                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={() => deleteTask(board.id, col.id, task.id)}
                  />
                  {task.status && (
                    <span className="absolute top-1 left-1 text-[10px] px-1 py-0.5 rounded bg-yellow-200 text-yellow-800">
                      {task.status}
                    </span>
                  )}
                  <span className="mt-4">{task.text}</span>
                  {task.date && (
                    <span className="text-xs text-red-500">{task.date}</span>
                  )}
                  {task.assigneeEmails && task.assigneeEmails.length > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      {task.assigneeEmails.map((email) => (
                        <div
                          key={email}
                          className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          {email.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      <span className="text-xs text-gray-400">
                        {task.assigneeEmails.join(", ")}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleAddTask(col.id)}
              className="mt-3 text-sm p-2 bg-blue-500 text-white rounded-lg w-full justify-center flex items-center gap-1"
            >
              <Plus size={14} /> Add Tasks
            </button>
          </div>
        ))}

        <div className="w-64 flex-shrink-0 flex items-center justify-center">
          <button
            onClick={handleAddColumn}
            className="text-gray-500 shadow-lg items-center gap-1 p-3 border h-20 w-60 flex justify-center  font-bold rounded-lg bg-white hover:bg-gray-100"
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
