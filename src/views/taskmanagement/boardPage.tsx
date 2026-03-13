import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useBoard } from "@/contexts/boardContext";
import type { BoardTask } from "@/contexts/boardContext";
import { Plus, Trash2, SquarePen } from "lucide-react";

const BoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { boards, renameBoard, addColumn, renameColumn, deleteColumn, addTask, updateTask, deleteTask, moveTask } = useBoard();
  const board = boards.find((b) => b.id === boardId);

  // ALL hooks declared before any conditional return (Rules of Hooks)
  const dragItem = useRef<{ columnId: string; taskId: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [newName, setNewName] = useState(board?.name || "");

  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const [renameColDialog, setRenameColDialog] = useState<{ id: string; title: string } | null>(null);
  const [deleteColId, setDeleteColId] = useState<string | null>(null);

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskColumn, setTaskColumn] = useState<string | null>(null);
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskEmails, setTaskEmails] = useState("");
  const [taskStatus, setTaskStatus] = useState<"Pending" | "Urgent" | "Medium" | "Complete" | "In Progress" | "">("");

  const [editTaskState, setEditTaskState] = useState<{
    colId: string;
    task: BoardTask;
    text: string;
    date: string;
    emails: string;
    status: string;
  } | null>(null);

  React.useEffect(() => {
    if (board) setNewName(board.name);
  }, [board]);

  // Early return AFTER all hooks
  if (!board) {
    return <p className="text-red-500">Board not found</p>;
  }

  const handleDragStart = (taskId: string, from: string) => {
    dragItem.current = { columnId: from, taskId };
  };

  const handleDrop = (to: string) => {
    if (!dragItem.current) return;
    const { columnId, taskId } = dragItem.current;
    if (columnId === to) return;
    moveTask(board.id, columnId, to, taskId);
    dragItem.current = null;
    setDragOverCol(null);
  };

  const handleRename = () => {
    if (newName.trim() && newName !== board.name) renameBoard(board.id, newName.trim());
  };

  const handleAddColumn = () => { setNewColumnTitle(""); setShowColumnDialog(true); };
  const confirmAddColumn = () => {
    if (newColumnTitle.trim()) addColumn(board.id, newColumnTitle.trim());
    setShowColumnDialog(false);
  };

  const openRenameCol = (colId: string, current: string) => setRenameColDialog({ id: colId, title: current });
  const confirmRenameCol = () => {
    if (renameColDialog?.title.trim()) renameColumn(board.id, renameColDialog.id, renameColDialog.title.trim());
    setRenameColDialog(null);
  };

  const confirmDeleteCol = () => {
    if (deleteColId) deleteColumn(board.id, deleteColId);
    setDeleteColId(null);
  };

  const handleAddTask = (colId: string) => {
    setTaskColumn(colId); setTaskText(""); setTaskDate(""); setTaskEmails(""); setTaskStatus("");
    setShowTaskDialog(true);
  };
  const confirmAddTask = () => {
    if (!taskColumn || !taskText.trim()) return;
    const emails = taskEmails.split(",").map((e) => e.trim()).filter(Boolean);
    addTask(board.id, taskColumn, { text: taskText.trim(), date: taskDate, assigneeEmails: emails, status: taskStatus || undefined });
    setShowTaskDialog(false);
  };

  const openEditTask = (colId: string, task: BoardTask) => {
    setEditTaskState({ colId, task, text: task.text, date: task.date || "", emails: (task.assigneeEmails || []).join(", "), status: task.status || "" });
  };
  const confirmEditTask = () => {
    if (!editTaskState || !editTaskState.text.trim()) return;
    const emails = editTaskState.emails.split(",").map((e) => e.trim()).filter(Boolean);
    updateTask(board.id, editTaskState.colId, editTaskState.task.id, {
      text: editTaskState.text.trim(),
      date: editTaskState.date,
      assigneeEmails: emails,
      status: (editTaskState.status as BoardTask["status"]) || undefined,
    });
    setEditTaskState(null);
  };

  return (
    <>
      {showColumnDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">New Section</h2>
            <input type="text" value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAddColumn()}
              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Section title" autoFocus />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowColumnDialog(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmAddColumn}>Add</button>
            </div>
          </div>
        </div>
      )}

      {renameColDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Rename Section</h2>
            <input type="text" value={renameColDialog.title}
              onChange={(e) => setRenameColDialog({ ...renameColDialog, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && confirmRenameCol()}
              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" autoFocus />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setRenameColDialog(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmRenameCol}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteColId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete Section?</h2>
            <p className="text-sm text-gray-500 mb-4">All tasks in this section will be deleted.</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteColId(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={confirmDeleteCol}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showTaskDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">New Task</h2>
            <input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAddTask()}
              className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Description" autoFocus />
            <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" value={taskEmails} onChange={(e) => setTaskEmails(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2" placeholder="Assignee emails (comma separated)" />
            <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as any)}
              className="w-full border px-3 py-2 rounded mb-4">
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowTaskDialog(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmAddTask}>Add</button>
            </div>
          </div>
        </div>
      )}

      {editTaskState && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Edit Task</h2>
            <input type="text" value={editTaskState.text}
              onChange={(e) => setEditTaskState({ ...editTaskState, text: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && confirmEditTask()}
              className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Description" autoFocus />
            <input type="date" value={editTaskState.date}
              onChange={(e) => setEditTaskState({ ...editTaskState, date: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" value={editTaskState.emails}
              onChange={(e) => setEditTaskState({ ...editTaskState, emails: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-2" placeholder="Assignee emails (comma separated)" />
            <select value={editTaskState.status}
              onChange={(e) => setEditTaskState({ ...editTaskState, status: e.target.value })}
              className="w-full border px-3 py-2 rounded mb-4">
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditTaskState(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmEditTask}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg shadow-md border bg-white p-5">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleRename}
            className="text-2xl font-bold border-b border-gray-300 focus:outline-none w-full bg-transparent" />
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {board.columns.map((col) => (
            <div key={col.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
              className={`bg-white p-4 rounded-lg shadow-md w-64 flex-shrink-0 transition-colors duration-200 ${dragOverCol === col.id ? "bg-blue-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex-1 truncate">{col.title}</h3>
                <div className="flex items-center gap-1 ml-1">
                  <button onClick={() => openRenameCol(col.id, col.title)}>
                    <SquarePen size={13} className="text-gray-400 hover:text-blue-500 cursor-pointer" />
                  </button>
                  <button onClick={() => setDeleteColId(col.id)}>
                    <Trash2 size={13} className="text-gray-400 hover:text-red-500 cursor-pointer" />
                  </button>
                </div>
              </div>

              <ul className="space-y-2">
                {col.tasks.map((task) => (
                  <li key={task.id} draggable onDragStart={() => handleDragStart(task.id, col.id)}
                    className="bg-white p-2 border rounded shadow-sm flex flex-col relative cursor-grab active:cursor-grabbing">
                    <div className="absolute top-1 right-1 flex items-center gap-1">
                      <button onClick={() => openEditTask(col.id, task)}>
                        <SquarePen size={11} className="text-gray-400 hover:text-blue-500 cursor-pointer" />
                      </button>
                      <button onClick={() => deleteTask(board.id, col.id, task.id)}>
                        <Trash2 size={11} className="text-gray-400 hover:text-red-500 cursor-pointer" />
                      </button>
                    </div>
                    {task.status && (
                      <span className="absolute top-1 left-1 text-[10px] px-1 py-0.5 rounded bg-yellow-200 text-yellow-800">
                        {task.status}
                      </span>
                    )}
                    <span className="mt-4 text-sm">{task.text}</span>
                    {task.date && <span className="text-xs text-red-500 mt-0.5">{task.date}</span>}
                    {task.assigneeEmails && task.assigneeEmails.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 flex-wrap">
                        {task.assigneeEmails.map((email) => (
                          <div key={email} title={email}
                            className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">
                            {email.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        <span className="text-xs text-gray-400 truncate">{task.assigneeEmails.join(", ")}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleAddTask(col.id)}
                className="mt-3 text-sm p-2 bg-blue-500 text-white rounded-lg w-full justify-center flex items-center gap-1 hover:bg-blue-600">
                <Plus size={14} /> Add Tasks
              </button>
            </div>
          ))}

          <div className="w-64 flex-shrink-0 flex items-center justify-center">
            <button onClick={handleAddColumn}
              className="text-gray-500 shadow-lg items-center gap-1 p-3 border h-20 w-60 flex justify-center font-bold rounded-lg bg-white hover:bg-gray-100">
              <Plus size={18} /> Add section
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardPage;
