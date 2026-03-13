import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBoard } from "@/contexts/boardContext";
import type { BoardTask } from "@/contexts/boardContext";
import { Plus, Trash2, SquarePen } from "lucide-react";

const BoardPage = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const {
    boards,
    deleteBoard,
    renameBoard,
    addColumn,
    renameColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoard();
  const board = boards.find((b) => b.id === boardId);

  const dragItem = useRef<{ columnId: string; taskId: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [newName, setNewName] = useState(board?.name || "");

  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const [renameColDialog, setRenameColDialog] = useState<{ id: string; title: string } | null>(null);
  const [isRenamingColumn, setIsRenamingColumn] = useState(false);

  const [deleteColId, setDeleteColId] = useState<string | null>(null);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);

  const [showDeleteBoardDialog, setShowDeleteBoardDialog] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);

  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskColumn, setTaskColumn] = useState<string | null>(null);
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskEmails, setTaskEmails] = useState("");
  const [taskStatus, setTaskStatus] = useState<"Pending" | "Urgent" | "Medium" | "Complete" | "In Progress" | "">("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [editTaskState, setEditTaskState] = useState<{
    colId: string;
    task: BoardTask;
    text: string;
    date: string;
    emails: string;
    status: string;
  } | null>(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  React.useEffect(() => {
    if (board) setNewName(board.name);
  }, [board]);

  if (!board) {
    return <p className="text-red-500">Board not found</p>;
  }

  const handleDragStart = (taskId: string, from: string) => {
    dragItem.current = { columnId: from, taskId };
  };

  const handleDrop = async (to: string) => {
    if (!dragItem.current) return;
    const { columnId, taskId } = dragItem.current;
    if (columnId === to) return;
    await moveTask(board.id, columnId, to, taskId);
    dragItem.current = null;
    setDragOverCol(null);
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== board.name) {
      await renameBoard(board.id, newName.trim());
    }
  };

  const handleAddColumn = () => {
    setNewColumnTitle("");
    setShowColumnDialog(true);
  };

  const confirmAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    setIsAddingColumn(true);
    await addColumn(board.id, newColumnTitle.trim());
    setIsAddingColumn(false);
    setShowColumnDialog(false);
  };

  const openRenameCol = (colId: string, current: string) => {
    setRenameColDialog({ id: colId, title: current });
  };

  const confirmRenameCol = async () => {
    if (!renameColDialog?.title.trim()) return;
    setIsRenamingColumn(true);
    await renameColumn(board.id, renameColDialog.id, renameColDialog.title.trim());
    setIsRenamingColumn(false);
    setRenameColDialog(null);
  };

  const confirmDeleteCol = async () => {
    if (!deleteColId) return;
    setIsDeletingColumn(true);
    await deleteColumn(board.id, deleteColId);
    setIsDeletingColumn(false);
    setDeleteColId(null);
  };

  const confirmDeleteBoard = async () => {
    setIsDeletingBoard(true);
    await deleteBoard(board.id);
    setIsDeletingBoard(false);
    setShowDeleteBoardDialog(false);
    navigate("/my-task");
  };

  const handleAddTask = (colId: string) => {
    setTaskColumn(colId);
    setTaskText("");
    setTaskDate("");
    setTaskEmails("");
    setTaskStatus("");
    setShowTaskDialog(true);
  };

  const confirmAddTask = async () => {
    if (!taskColumn || !taskText.trim()) return;
    setIsAddingTask(true);
    const emails = taskEmails.split(",").map((e) => e.trim()).filter(Boolean);
    await addTask(board.id, taskColumn, {
      text: taskText.trim(),
      date: taskDate,
      assigneeEmails: emails,
      status: taskStatus || undefined,
    });
    setIsAddingTask(false);
    setShowTaskDialog(false);
  };

  const openEditTask = (colId: string, task: BoardTask) => {
    setEditTaskState({
      colId,
      task,
      text: task.text,
      date: task.date || "",
      emails: (task.assigneeEmails || []).join(", "),
      status: task.status || "",
    });
  };

  const confirmEditTask = async () => {
    if (!editTaskState || !editTaskState.text.trim()) return;
    setIsSavingTask(true);
    const emails = editTaskState.emails.split(",").map((e) => e.trim()).filter(Boolean);
    await updateTask(board.id, editTaskState.colId, editTaskState.task.id, {
      text: editTaskState.text.trim(),
      date: editTaskState.date,
      assigneeEmails: emails,
      status: (editTaskState.status as BoardTask["status"]) || undefined,
    });
    setIsSavingTask(false);
    setEditTaskState(null);
  };

  return (
    <>
      {showColumnDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">New Section</h2>
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAddColumn()}
              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Section title"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowColumnDialog(false)} disabled={isAddingColumn}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmAddColumn} disabled={isAddingColumn}>{isAddingColumn ? "Adding..." : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {renameColDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Rename Section</h2>
            <input
              type="text"
              value={renameColDialog.title}
              onChange={(e) => setRenameColDialog({ ...renameColDialog, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && confirmRenameCol()}
              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setRenameColDialog(null)} disabled={isRenamingColumn}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmRenameCol} disabled={isRenamingColumn}>{isRenamingColumn ? "Saving..." : "Save"}</button>
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
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteColId(null)} disabled={isDeletingColumn}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={confirmDeleteCol} disabled={isDeletingColumn}>{isDeletingColumn ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteBoardDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete Board?</h2>
            <p className="text-sm text-gray-500 mb-4">This will remove the board, its sections, and tasks.</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowDeleteBoardDialog(false)} disabled={isDeletingBoard}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={confirmDeleteBoard} disabled={isDeletingBoard}>{isDeletingBoard ? "Deleting..." : "Delete Board"}</button>
            </div>
          </div>
        </div>
      )}

      {showTaskDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">New Task</h2>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmAddTask()}
              className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Description"
              autoFocus
            />
            <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" value={taskEmails} onChange={(e) => setTaskEmails(e.target.value)} className="w-full border px-3 py-2 rounded mb-2" placeholder="Assignee emails (comma separated)" />
            <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as any)} className="w-full border px-3 py-2 rounded mb-4">
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowTaskDialog(false)} disabled={isAddingTask}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmAddTask} disabled={isAddingTask}>{isAddingTask ? "Adding..." : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {editTaskState && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Edit Task</h2>
            <input
              type="text"
              value={editTaskState.text}
              onChange={(e) => setEditTaskState({ ...editTaskState, text: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && confirmEditTask()}
              className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Description"
              autoFocus
            />
            <input type="date" value={editTaskState.date} onChange={(e) => setEditTaskState({ ...editTaskState, date: e.target.value })} className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" value={editTaskState.emails} onChange={(e) => setEditTaskState({ ...editTaskState, emails: e.target.value })} className="w-full border px-3 py-2 rounded mb-2" placeholder="Assignee emails (comma separated)" />
            <select value={editTaskState.status} onChange={(e) => setEditTaskState({ ...editTaskState, status: e.target.value })} className="w-full border px-3 py-2 rounded mb-4">
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Complete">Complete</option>
              <option value="In Progress">In Progress</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditTaskState(null)} disabled={isSavingTask}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={confirmEditTask} disabled={isSavingTask}>{isSavingTask ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg shadow-md border bg-white p-5">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleRename} className="text-2xl font-bold border-b border-gray-300 focus:outline-none w-full bg-transparent" />
          <button type="button" onClick={() => setShowDeleteBoardDialog(true)} className="px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm">Delete Board</button>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {board.columns.map((col) => (
            <div
              key={col.id}
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
                  <li
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id, col.id)}
                    className="bg-white p-2 border rounded shadow-sm flex flex-col relative cursor-grab active:cursor-grabbing"
                  >
                    <div className="absolute top-1 right-1 flex items-center gap-1">
                      <button onClick={() => openEditTask(col.id, task)}>
                        <SquarePen size={11} className="text-gray-400 hover:text-blue-500 cursor-pointer" />
                      </button>
                      <button onClick={() => deleteTask(board.id, col.id, task.id)}>
                        <Trash2 size={11} className="text-gray-400 hover:text-red-500 cursor-pointer" />
                      </button>
                    </div>
                    {task.status && (
                      <span className="absolute top-1 left-1 text-[10px] px-1 py-0.5 rounded bg-yellow-200 text-yellow-800">{task.status}</span>
                    )}
                    <span className="mt-4 text-sm">{task.text}</span>
                    {task.date && <span className="text-xs text-red-500 mt-0.5">{task.date}</span>}
                    {task.assigneeEmails && task.assigneeEmails.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 flex-wrap">
                        {task.assigneeEmails.map((email) => (
                          <div key={email} title={email} className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">{email.charAt(0).toUpperCase()}</div>
                        ))}
                        <span className="text-xs text-gray-400 truncate">{task.assigneeEmails.join(", ")}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleAddTask(col.id)} className="mt-3 text-sm p-2 bg-blue-500 text-white rounded-lg w-full justify-center flex items-center gap-1 hover:bg-blue-600">
                <Plus size={14} /> Add Tasks
              </button>
            </div>
          ))}

          <div className="w-64 flex-shrink-0 flex items-center justify-center">
            <button onClick={handleAddColumn} className="text-gray-500 shadow-lg items-center gap-1 p-3 border h-20 w-60 flex justify-center font-bold rounded-lg bg-white hover:bg-gray-100">
              <Plus size={18} /> Add section
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardPage;
