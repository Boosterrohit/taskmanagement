import { Button } from "@/components/ui/button";
import { useTasks } from "@/contexts/taskContext";
import { useToast } from "@/contexts/toastContext";
import type { TaskBucket } from "@/types/task";
import { ChevronRight, Lock, Plus, SquarePen, Trash2, User2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const columns: Array<{ key: TaskBucket; title: string; day: string }> = [
  { key: "today", title: "Today", day: "Now" },
  { key: "tomorrow", title: "Tomorrow", day: "Next" },
  { key: "upcoming", title: "Upcoming", day: "Soon" },
  { key: "someday", title: "Someday", day: "Anytime" },
];

const AllTasks = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { showSuccess, showError } = useToast();

  const { getTasksByListType, addTask, updateTask, deleteTask, toggleComplete, loading } = useTasks();
  const listTasks = getTasksByListType("all-tasks");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputTitle, setInputTitle] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [inputByBucket, setInputByBucket] = useState<Record<TaskBucket, string>>({
    today: "",
    tomorrow: "",
    upcoming: "",
    someday: "",
  });
  const [dateByBucket, setDateByBucket] = useState<Record<TaskBucket, string>>({
    today: "",
    tomorrow: "",
    upcoming: "",
    someday: "",
  });
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "completed">("pending");
  const [isAddingOverview, setIsAddingOverview] = useState(false);
  const [addingBucket, setAddingBucket] = useState<TaskBucket | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // edit dialog state
  const [editTask, setEditTask] = useState<{ id: string; title: string; dueDate: string } | null>(null);

  const dragTask = useRef<{ id: string; from: TaskBucket } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskBucket | null>(null);

  const selectedTask = listTasks.find((task) => task.id === selectedId) || null;
  const activeTasks = useMemo(() => listTasks.filter((task) => !task.completed), [listTasks]);
  const filteredOverviewTasks = useMemo(() => {
    if (taskFilter === "pending") return listTasks.filter((task) => !task.completed);
    if (taskFilter === "completed") return listTasks.filter((task) => task.completed);
    return listTasks;
  }, [listTasks, taskFilter]);
  const completedCount = useMemo(() => listTasks.filter((task) => task.completed).length, [listTasks]);

  const tasksByBucket = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.key] = listTasks.filter((task) => (task.bucket || "someday") === column.key);
      return acc;
    }, {} as Record<TaskBucket, typeof listTasks>);
  }, [listTasks]);

  const addOverviewTask = async () => {
    const title = inputTitle.trim();
    if (!title) return;

    setIsAddingOverview(true);
    try {
      const created = await addTask({
        title,
        listType: "all-tasks",
        dueDate: inputDate || null,
        bucket: "today",
      });

      setInputTitle("");
      setInputDate("");
      setSelectedId(created.id);
      showSuccess("Task added");
    } catch {
      showError("Failed to add task");
    } finally {
      setIsAddingOverview(false);
    }
  };

  const addBucketTask = async (bucket: TaskBucket) => {
    const title = inputByBucket[bucket].trim();
    if (!title) return;

    setAddingBucket(bucket);
    try {
      await addTask({
        title,
        listType: "all-tasks",
        dueDate: dateByBucket[bucket] || null,
        bucket,
      });

      setInputByBucket((prev) => ({ ...prev, [bucket]: "" }));
      setDateByBucket((prev) => ({ ...prev, [bucket]: "" }));
      showSuccess("Task added");
    } catch {
      showError("Failed to add task");
    } finally {
      setAddingBucket(null);
    }
  };

  const editTitle = async (id: string, currentTitle: string, currentDueDate: string | null) => {
    setEditTask({ id, title: currentTitle, dueDate: currentDueDate || "" });
  };

  const confirmEdit = async () => {
    if (!editTask) return;
    const trimmed = editTask.title.trim();
    if (!trimmed) return;
    setIsSavingEdit(true);
    try {
      await updateTask(editTask.id, { title: trimmed, dueDate: editTask.dueDate || null });
      setEditTask(null);
      showSuccess("Task updated");
    } catch {
      showError("Failed to update task");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      if (selectedId === id) setSelectedId(null);
      showSuccess("Task deleted");
    } catch {
      showError("Failed to delete task");
    }
  };

  const onDragStart = (id: string, from: TaskBucket) => {
    dragTask.current = { id, from };
  };

  const onDrop = async (to: TaskBucket) => {
    if (!dragTask.current) return;
    const { id, from } = dragTask.current;
    if (from === to) return;
    await updateTask(id, { bucket: to });
    dragTask.current = null;
    setDragOverCol(null);
  };

  return (
    <section>
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
      {activeTab === "overview" && (
        <div className="h-[85vh] overflow-auto flex md:flex-row flex-col gap-7">
          <div className="flex md:w-[80%] md:h-[85vh] min-h-[400px] relative overflow-hidden flex-col gap-4 bg-white shadow-lg p-6 border-2 rounded-xl">
            <div className="md:h-[68vh] h-[600px] hide-scrollbar overflow-y-scroll">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">All Tasks</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTaskFilter("pending")} className={`text-xs px-3 py-1 rounded-full border ${taskFilter === "pending" ? "bg-blue-500 text-white border-blue-500" : "text-gray-600"}`}>Pending</button>
                  <button onClick={() => setTaskFilter("completed")} className={`text-xs px-3 py-1 rounded-full border ${taskFilter === "completed" ? "bg-green-500 text-white border-green-500" : "text-gray-600"}`}>Completed</button>
                  {/* <button onClick={() => setTaskFilter("all")} className={`text-xs px-3 py-1 rounded-full border ${taskFilter === "all" ? "bg-gray-700 text-white border-gray-700" : "text-gray-600"}`}>All</button> */}
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-gray-500 mt-2">Loading tasks...</p>
              ) : (
                <ul className="space-y-3 mt-3">
                  {filteredOverviewTasks.length === 0 && (
                    <li className="text-sm text-gray-500">No tasks for selected filter.</li>
                  )}
                  {filteredOverviewTasks.map((task) => (
                    <li
                      key={task.id}
                      onClick={() => setSelectedId(task.id)}
                      className={`bg-white p-3 border shadow-md rounded-lg cursor-pointer ${selectedId === task.id ? "border-purple-400 border-2" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => toggleComplete(task.id, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <p>{task.title}</p>
                            <span className="text-xs text-gray-400">{task.dueDate || "No due date"}</span>
                          </div>
                        </label>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); editTitle(task.id, task.title, task.dueDate); }}>
                            <SquarePen size={15} className="text-blue-600" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>
                            <Trash2 size={16} color="red" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="absolute bottom-0 py-3 bg-white left-0 w-full px-5">
              <div className="rounded-2xl border shadow-md p-2 flex flex-col gap-2">
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder="Add task..."
                  className="rounded-md h-11  px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && addOverviewTask()}
                />
               <div className="flex items-center justify-between gap-2">
                 <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="rounded-md h-11 px-3 py-2 border w-full md:w-52"
                />
                <button
                  onClick={addOverviewTask}
                  disabled={isAddingOverview || !inputTitle.trim()}
                  className="bg-blue-500 w-full text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <Plus size={20} />{isAddingOverview ? "Adding..." : "Add"}
                </button>
               </div>
              </div>
            </div>
          </div>

          <div className="bg-white relative w-full rounded-xl shadow-lg p-6 border-2">
            {selectedTask ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="md:flex hidden items-center text-sm gap-2 text-gray-500">
                    <Lock size={15} /> My List <ChevronRight size={15} /> All Tasks
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-white shadow-md text-xs p-1 border rounded-full text-gray-500"
                      onClick={() => toggleComplete(selectedTask.id, !selectedTask.completed)}
                    >
                      {selectedTask.completed ? "Mark As Pending" : "Mark As Complete"}
                    </button>
                    <button onClick={() => editTitle(selectedTask.id, selectedTask.title, selectedTask.dueDate)}>
                      <SquarePen size={16} className="text-blue-600" />
                    </button>
                    <button onClick={() => handleDeleteTask(selectedTask.id)}>
                      <Trash2 size={18} color="red" />
                    </button>
                  </div>
                </div>

                <div className="my-8">
                  <h1 className="text-2xl font-bold">{selectedTask.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">{selectedTask.dueDate || "No due date"}</p>
                  </div>
                </div>

                <div>
                  <textarea
                    className="w-full hide-scrollbar h-32 p-3 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Add a Note..."
                    value={selectedTask.notes || ""}
                    onChange={(e) => updateTask(selectedTask.id, { notes: e.target.value })}
                  />
                  <Button className="bg-blue-500 hover:bg-blue-600 mt-5" onClick={() => updateTask(selectedTask.id, { notes: "" })}>
                    <Plus /> Clear Note
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a task to see details.</p>
            )}

            <div className="absolute bottom-5 w-full left-0 px-6 md:grid hidden grid-cols-3 gap-3">
              <div className="bg-white rounded-md w-full border-2 border-green-400 p-4">
                <h4 className="text-xl font-semibold">Tasks</h4>
                <span className="text-base font-bold text-gray-500">{listTasks.length}</span>
              </div>
              <div className="bg-white rounded-md w-full border-2 border-blue-400 p-4">
                <h4 className="text-xl font-semibold">Pending</h4>
                <span className="text-base font-bold text-gray-500">{activeTasks.length}</span>
              </div>
              <div className="bg-white rounded-md w-full border-2 border-red-400 p-4">
                <h4 className="text-xl font-semibold">Completed</h4>
                <span className="text-base font-bold text-gray-500">{completedCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="flex hide-scrollbar items-start gap-6 w-full overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`bg-white shadow-lg min-h-[500px] w-[350px] shrink-0 flex flex-col p-5 rounded-3xl transition-all duration-200 ${
                dragOverCol === column.key ? "ring-2 ring-blue-400 bg-blue-50" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(column.key);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => onDrop(column.key)}
            >
              <div className="flex-1 overflow-y-auto">
                <p className="flex gap-2 items-center mb-2">
                  <span className="text-xl font-bold text-black">{column.title}</span>
                  <span className="text-xl font-bold text-gray-300">{column.day}</span>
                </p>

                <ul className="space-y-3">
                  {tasksByBucket[column.key].length === 0 && (
                    <li className="text-center text-gray-300 text-sm py-8 border-2 border-dashed rounded-2xl">
                      Drop tasks here
                    </li>
                  )}
                  {tasksByBucket[column.key].map((task) => (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={() => onDragStart(task.id, column.key)}
                      className="bg-white border shadow-md p-3 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-200 select-none"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-0.5 text-gray-400 text-xs">
                          <User2 size={11} /> Rohit
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => editTitle(task.id, task.title, task.dueDate)}>
                            <SquarePen size={14} className="text-blue-600" />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 size={15} color="red" className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>
                      <p className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-0.5 shrink-0"
                          checked={task.completed}
                          onChange={(e) => toggleComplete(task.id, e.target.checked)}
                        />
                        <span className={task.completed ? "line-through text-gray-500" : ""}>{task.title}</span>
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">{task.dueDate || "No due date"}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Add tasks..."
                    value={inputByBucket[column.key]}
                    onChange={(e) => setInputByBucket((prev) => ({ ...prev, [column.key]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addBucketTask(column.key)}
                    className="rounded-full h-11 px-4 py-2 w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={() => addBucketTask(column.key)}
                    disabled={addingBucket === column.key || !inputByBucket[column.key].trim()}
                    className="absolute right-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />{addingBucket === column.key ? "Adding..." : "Add"}
                  </button>
                </div>
                <input
                  type="date"
                  value={dateByBucket[column.key]}
                  onChange={(e) => setDateByBucket((prev) => ({ ...prev, [column.key]: e.target.value }))}
                  className="w-full text-sm border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AllTasks;
