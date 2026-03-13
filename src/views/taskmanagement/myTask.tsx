import { Plus, SquarePen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTasks } from "@/contexts/taskContext";

const MyTask = () => {
  const { getTasksByListType, addTask, updateTask, deleteTask, toggleComplete, loading } = useTasks();
  const [inputTitle, setInputTitle] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // edit dialog state
  const [editTask, setEditTask] = useState<{ id: string; title: string; dueDate: string } | null>(null);

  const myDayTasks = getTasksByListType("my-day");

  const activeTasks = useMemo(
    () => myDayTasks.filter((task) => !task.completed),
    [myDayTasks]
  );
  const completedTasks = useMemo(
    () => myDayTasks.filter((task) => task.completed),
    [myDayTasks]
  );

  const handleAddTask = async () => {
    const title = inputTitle.trim();
    if (!title) return;
    setIsAddingTask(true);
    await addTask({ title, listType: "my-day", dueDate: inputDate || null });
    setIsAddingTask(false);
    setInputTitle("");
    setInputDate("");
  };

  const openEdit = (id: string, title: string, dueDate: string | null) => {
    setEditTask({ id, title, dueDate: dueDate || "" });
  };

  const confirmEdit = async () => {
    if (!editTask) return;
    const trimmed = editTask.title.trim();
    if (!trimmed) return;
    setIsSavingEdit(true);
    await updateTask(editTask.id, { title: trimmed, dueDate: editTask.dueDate || null });
    setIsSavingEdit(false);
    setEditTask(null);
  };

  return (
    <section className="h-[85vh] relative">
      {/* Edit task dialog */}
      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-3">Edit Task</h2>
            <input
              type="text"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
              className="w-full border px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Task title"
              autoFocus
            />
            <label className="text-xs text-gray-500 mb-1 block">Due date</label>
            <input
              type="date"
              value={editTask.dueDate}
              onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setEditTask(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-blue-500 text-white" onClick={confirmEdit} disabled={isSavingEdit}>{isSavingEdit ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="md:p-6 h-[490px] overflow-y-auto hide-scrollbar">
        <div>
          <h1 className="text-2xl text-black font-bold mt-4">Your Tasks</h1>
          {loading ? (
            <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {activeTasks.length === 0 && (
                <li className="text-sm text-gray-500">No pending tasks in My Day.</li>
              )}
              {activeTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex justify-between items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={task.completed}
                      onChange={(e) => toggleComplete(task.id, e.target.checked)}
                    />
                    <p className="flex flex-col">
                      <span className="text-gray-700">{task.title}</span>
                      <span className="text-gray-400 text-sm">
                        {task.dueDate || "No due date"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(task.id, task.title, task.dueDate)}>
                      <SquarePen size={18} className="text-blue-500" />
                    </button>
                    <button onClick={() => deleteTask(task.id)}>
                      <Trash2 size={18} color="red" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h1 className="text-2xl text-black font-bold mt-6">Completed Tasks</h1>
          <ul className="mt-2 space-y-3 pb-24">
            {completedTasks.length === 0 && (
              <li className="text-sm text-gray-500">No completed tasks yet.</li>
            )}
            {completedTasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center border bg-white p-4 rounded-lg shadow-md gap-4 w-full"
              >
                <p className="flex flex-col">
                  <del className="text-gray-400">{task.title}</del>
                  <span className="text-gray-400 text-sm">{task.dueDate || "No due date"}</span>
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleComplete(task.id, false)} className="text-xs text-blue-600">
                    Reopen
                  </button>
                  <button onClick={() => deleteTask(task.id)}>
                    <Trash2 size={20} color="red" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-1 left-0 w-full bg-white rounded-md md:rounded-full overflow-hidden shadow-lg border border-gray-300 px-2 py-2">
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Add task..."
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="rounded-md h-11 px-3 py-2 w-full focus:outline-none  md:border-none border border-gray-300"
            />
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="rounded-md h-11 px-3 py-2 border w-full md:w-52"
            />
            <button
              onClick={handleAddTask}
              disabled={isAddingTask || !inputTitle.trim()}
              className="bg-blue-500 text-white px-4 py-2 h-11 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center w-full md:w-auto justify-center"
            >
              <Plus size={20} />{isAddingTask ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyTask;
