import { Plus, SquarePen, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useTasks } from "@/contexts/taskContext";
import { useToast } from "@/contexts/toastContext";
import noTask from '../../assets/noTask.jpg';
import complete from "../../assets/complete.jpg";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// yyyy-mm-dd, built from local date parts (avoids UTC off-by-one from toISOString)
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
}

const DatePicker = ({ value, onChange, className = "" }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayIso = toIsoDate(new Date());

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goToMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  const selectDay = (day: number) => {
    const picked = new Date(year, month, day);
    onChange(toIsoDate(picked));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-md h-11 px-3 py-2 border w-full md:w-52 text-left transition-colors ${
          value ? "border-gray-300 text-gray-700" : "border-red-300 text-gray-400"
        } hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400`}
      >
        <Calendar size={16} className={value ? "text-blue-500" : "text-gray-400"} />
        <span className="flex-1 truncate">{value ? formatDisplayDate(value) : "Select date"}</span>
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center text-xs font-medium text-gray-400 py-1">
                {wd}
              </div>
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
                    ${isToday && !isSelected ? "border border-blue-400 text-blue-600" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 text-center"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const MyTask = () => {
  const { getTasksByListType, addTask, updateTask, deleteTask, toggleComplete, loading } = useTasks();
  const { showSuccess, showError } = useToast();
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
    // Required-date validation: block submission and surface the reason
    // instead of silently failing or letting an empty date through.
    if (!inputDate) {
      showError("Please select a due date before adding a task");
      return;
    }
    setIsAddingTask(true);
    try {
      await addTask({ title, listType: "my-day", dueDate: inputDate });
      setInputTitle("");
      setInputDate("");
      showSuccess("Task added");
    } catch {
      showError("Failed to add task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const openEdit = (id: string, title: string, dueDate: string | null) => {
    setEditTask({ id, title, dueDate: dueDate || "" });
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

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      showSuccess("Task deleted");
    } catch {
      showError("Failed to delete task");
    }
  };

  return (
    <section className="h-[85vh] flex flex-col min-h-0 relative">
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

      <div className="flex-1 min-h-0 md:p-6 flex md:flex-row flex-col gap-6">
        <div className="bg-white w-full md:w-1/2 min-w-0 h-full flex flex-col border rounded-lg shadow-md overflow-hidden">
          <div className="md:p-4 p-2 flex flex-col h-full min-h-0">
            <h1 className="md:text-2xl text-black font-bold shrink-0">Your Tasks</h1>
            {loading ? (
              <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
            ) : activeTasks.length === 0 ? (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4">
                <img
                  src={noTask}
                  alt="No tasks"
                  className="h-auto md:w-full md:max-w-64 w-2/5 opacity-75 object-contain"
                />
                <p className="text-gray-600 md:mt-4 font-bold">No pending tasks in My Day.</p>
                <p className="md:text-sm text-xs md:mt-2.5 text-gray-500">Looks like you're all caught up! <br/>Enjoy your day and stay productive</p>
              </div>
            ) : (
              <ul className="mt-2 space-y-3 flex-1 min-h-0 overflow-y-auto hide-scrollbar">
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
                      <button onClick={() => handleDelete(task.id)}>
                        <Trash2 size={18} color="red" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white w-full md:w-1/2 min-w-0 h-full flex flex-col border rounded-lg shadow-md overflow-hidden">
          <div className="md:p-4 p-2 flex flex-col h-full min-h-0">
            <h1 className="md:text-2xl text-black font-bold shrink-0">Completed Tasks</h1>
            {completedTasks.length === 0 ? (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4">
                <img
                  src={complete}
                  alt="No tasks"
                  className="h-auto md:w-full md:max-w-64 w-2/5 opacity-75 object-contain"
                />
                <p className="text-gray-600 md:mt-4 font-bold">No completed tasks yet.</p>
                <p className="md:text-sm text-xs md:mt-2.5 text-gray-500">You haven't completed any tasks yet! <br/>Let's get things done!</p>
              </div>
            ) : (
              <ul className="mt-2 space-y-3 flex-1 min-h-0 overflow-y-auto hide-scrollbar">
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
                      <button onClick={() => handleDelete(task.id)}>
                        <Trash2 size={20} color="red" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white rounded-md md:rounded-full overflow-visible shadow-lg border border-gray-300 px-2 py-2 mt-3">
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Add task..."
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="rounded-md h-11 px-3 py-2 w-full focus:outline-none  md:border-none border border-gray-300"
          />
         <div className="flex justify-between w-full md:w-fit gap-3">
           <DatePicker value={inputDate} onChange={setInputDate} className="w-full"/>
          <button
            onClick={handleAddTask}
            disabled={isAddingTask || !inputTitle.trim() || !inputDate}
            className="bg-blue-500 text-white px-4 py-2 h-11 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center w-32 md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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