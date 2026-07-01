import { Button } from "@/components/ui/button";
import { useTasks } from "@/contexts/taskContext";
import { useToast } from "@/contexts/toastContext";
import type { TaskBucket } from "@/types/task";
import { ChevronRight, Lock, Plus, SquarePen, Trash2, User2, Calendar, ChevronLeft } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import noTasks from "../../assets/noTask.jpg";
import complete from "../../assets/complete.jpg";
import select from "../../assets/select.jpg";
const columns: Array<{ key: TaskBucket; title: string; day: string }> = [
  { key: "today", title: "Today", day: "Now" },
  { key: "tomorrow", title: "Tomorrow", day: "Next" },
  { key: "upcoming", title: "Upcoming", day: "Soon" },
  { key: "someday", title: "Someday", day: "Anytime" },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Builds yyyy-mm-dd from local date parts. toISOString() would shift the date
// by your UTC offset near midnight — this avoids that off-by-one.
const toIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
};

interface DatePickerProps {
  value: string; // yyyy-mm-dd or ""
  onChange: (iso: string) => void;
  className?: string;
  pill?: boolean; // pill styling for the kanban column footers vs the default bar style
}

const PANEL_WIDTH = 288; // matches w-72

const DatePicker = ({ value, onChange, className = "", pill = false }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));
  const [coords, setCoords] = useState<{ left: number; anchorTop: number; anchorBottom: number; openUp: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const computePosition = () => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    // Flip to whichever side has more room instead of always assuming "up" —
    // a hardcoded direction breaks the moment this component is reused in a
    // different layout (which is exactly what happened going from MyTask to here).
    const openUp = spaceAbove > 340 || spaceAbove > spaceBelow;
    let left = rect.left;
    if (left + PANEL_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - PANEL_WIDTH - 8;
    }
    if (left < 8) left = 8;
    setCoords({ left, anchorTop: rect.top, anchorBottom: rect.bottom, openUp });
  };

  useEffect(() => {
    if (!open) return;
    computePosition();
    // Deliberate simplification: close on scroll instead of tracking position
    // live. Live-following the trigger through nested scroll containers
    // (kanban row scrolls horizontally, overview list scrolls vertically)
    // adds real complexity for a rare interaction — closing is simpler and
    // avoids a misaligned floating panel.
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setViewDate(value ? new Date(value) : new Date());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayIso = toIsoDate(new Date());

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goToMonth = (offset: number) => setViewDate(new Date(year, month + offset, 1));

  const selectDay = (day: number) => {
    onChange(toIsoDate(new Date(year, month, day)));
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 h-11 px-3 py-2 border text-left transition-colors ${
          pill ? "rounded-full" : "rounded-md"
        } ${value ? "border-gray-300 text-gray-700" : "border-red-300 text-gray-400"} hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      >
        <Calendar size={16} className={value ? "text-blue-500 shrink-0" : "text-gray-400 shrink-0"} />
        <span className="flex-1 truncate text-sm">{value ? formatDisplayDate(value) : "Select date"}</span>
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            left: coords.left,
            ...(coords.openUp
              ? { bottom: window.innerHeight - coords.anchorTop + 8 }
              : { top: coords.anchorBottom + 8 }),
          }}
          className="z-[9999] w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => goToMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-800">{MONTHS[month]} {year}</span>
            <button type="button" onClick={() => goToMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center text-xs font-medium text-gray-400 py-1">{wd}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const iso = toIsoDate(new Date(year, month, day));
              const isSelected = iso === value;
              const isToday = iso === todayIso;
              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => selectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-sm rounded-full transition-colors
                    ${isSelected ? "bg-blue-500 text-white font-semibold" : "text-gray-700 hover:bg-blue-50"}
                    ${isToday && !isSelected ? "border border-blue-400 text-blue-600" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 text-center"
            >
              Clear date
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

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
    if (!inputDate) {
      showError("Please select a due date before adding a task");
      return;
    }

    setIsAddingOverview(true);
    try {
      const created = await addTask({
        title,
        listType: "all-tasks",
        dueDate: inputDate,
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
    if (!dateByBucket[bucket]) {
      showError("Please select a due date before adding a task");
      return;
    }

    setAddingBucket(bucket);
    try {
      await addTask({
        title,
        listType: "all-tasks",
        dueDate: dateByBucket[bucket],
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
    <section className="p-2">
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
        <div className="md:h-[85vh] h-auto overflow-auto flex md:flex-row flex-col gap-7">
          <div className="flex md:w-[80%] md:h-[85vh] min-h-[400px] relative overflow-hidden flex-col gap-4 bg-white shadow-lg p-6 border-2 rounded-xl">
            <div className="md:h-[68vh] h-[600px] hide-scrollbar pb-32 overflow-y-scroll">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">All Tasks</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTaskFilter("pending")} className={`text-xs px-3 py-1 rounded-full border ${taskFilter === "pending" ? "bg-blue-500 text-white border-blue-500" : "text-gray-600"}`}>Pending</button>
                  <button onClick={() => setTaskFilter("completed")} className={`text-xs px-3 py-1 rounded-full border ${taskFilter === "completed" ? "bg-green-500 text-white border-green-500" : "text-gray-600"}`}>Completed</button>
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-gray-500 mt-2">Loading tasks...</p>
              ) : (
                <ul className="space-y-3 mt-3">
                  {filteredOverviewTasks.length === 0 && (
                     <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4 mt-10">
               {
                taskFilter === "pending" ? (
                   <img
                  src={noTasks}
                  alt="No tasks"
                  className="h-auto md:w-full md:max-w-64 w-2/5 opacity-75 object-contain"
                />
                ):(
                   <img
                  src={complete}
                  alt="No tasks"
                  className="h-auto md:w-full md:max-w-64 w-2/5 opacity-75 object-contain"
                />
                )}
               
                <p className="text-gray-600 md:mt-4 font-bold">No {taskFilter === "pending" ? "Pending" : "Completed"} tasks in My Day.</p>
                <p className="md:text-sm text-xs md:mt-2.5 text-gray-500">Looks like you're all caught up! <br/>Enjoy your day and stay productive</p>
              </div>
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
                  className="rounded-md h-11  px-3 py-2 w-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && addOverviewTask()}
                />
               <div className="flex items-center justify-between gap-2">
                 <DatePicker value={inputDate} onChange={setInputDate} className="w-full md:w-72" />
                <button
                  onClick={addOverviewTask}
                  disabled={isAddingOverview || !inputTitle.trim() || !inputDate}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full w-24 hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div>
                <p className="text-gray-700 font-semibold">Select a task to see details.</p>
                <p className="text-sm text-gray-400 py-1">Choose a task from the list to view its <br/> information and updates here.</p>
                <div className="flex flex-col items-center justify-center mt-10">
                   <img
                  src={select}
                  alt="Task Details"
                  className="h-auto md:w-full md:max-w-64 w-2/5 opacity-90 -mt-5 object-contain"
                />
                <p className="text-gray-600 font-semibold my-1 text-sm mt-3">No task selected yet.</p>
                <p className="text-gray-400 text-center text-sm">Please select a task to see its details, <br/>comments, and activity.</p>
                </div>
              </div>
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
              className={`bg-white shadow-lg min-h-[550px] w-[350px] shrink-0 flex flex-col p-5 rounded-3xl transition-all duration-200 ${
                dragOverCol === column.key ? "ring-2 ring-blue-400 bg-blue-50" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(column.key);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => onDrop(column.key)}
            >
              <div className="flex-1 overflow-y-auto  ">
                <p className="flex gap-2 items-center mb-2">
                  <span className="text-xl font-bold text-black">{column.title}</span>
                  <span className="text-xl font-bold text-gray-300">{column.day}</span>
                </p>

                <ul className="space-y-3  max-h-[400px] h-[350px] overflow-y-auto hide-scrollbar rounded-xl">
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
                      className="bg-white border shadow-md p-3 rounded-xl  cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-200 select-none"
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
                    disabled={addingBucket === column.key || !inputByBucket[column.key].trim() || !dateByBucket[column.key]}
                    className="absolute right-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />{addingBucket === column.key ? "Adding..." : "Add"}
                  </button>
                </div>
                <DatePicker
                  value={dateByBucket[column.key]}
                  onChange={(iso) => setDateByBucket((prev) => ({ ...prev, [column.key]: iso }))}
                  className="w-full"
                  pill
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