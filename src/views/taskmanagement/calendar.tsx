import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";
import { useTasks } from "@/contexts/taskContext";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatKey = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const Calendar = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // edit dialog state
  const [editTask, setEditTask] = useState<{ id: string; title: string; dueDate: string } | null>(null);

  const today = useMemo(() => new Date(), []);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth]);

  const daysGrid = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const cells: { date: Date; inCurrentMonth: boolean }[] = [];

    for (let i = startDay - 1; i >= 0; i -= 1) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1 - i - 1);
      cells.push({ date: d, inCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      cells.push({ date: d, inCurrentMonth: true });
    }

    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      cells.push({ date: d, inCurrentMonth: false });
    }

    return cells;
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      if (!acc[task.dueDate]) acc[task.dueDate] = [];
      acc[task.dueDate].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);
  }, [tasks]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const openDialogForDate = (date: Date) => {
    setSelectedDate(date);
    setNewTaskTitle("");
    setIsDialogOpen(true);
  };

  const handleDayClick = (cellDate: Date, inCurrentMonth: boolean) => {
    if (!inCurrentMonth) {
      setCurrentMonth(new Date(cellDate.getFullYear(), cellDate.getMonth(), 1));
    }
    openDialogForDate(cellDate);
  };

  const handleAddTask = async () => {
    if (!selectedDate || !newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle.trim(),
      listType: "calendar",
      dueDate: formatKey(selectedDate),
      bucket: null,
    });
    setNewTaskTitle("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
    setNewTaskTitle("");
  };

  const editTask_open = (id: string, current: string, currentDate: string) => {
    setEditTask({ id, title: current, dueDate: currentDate });
  };

  const confirmEdit = async () => {
    if (!editTask) return;
    const trimmed = editTask.title.trim();
    if (!trimmed) return;
    await updateTask(editTask.id, { title: trimmed, dueDate: editTask.dueDate || null });
    setEditTask(null);
  };

  const selectedKey = selectedDate ? formatKey(selectedDate) : null;
  const selectedTasks = selectedKey ? tasksByDate[selectedKey] || [] : [];

  return (
    <div className="space-y-4">
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
              <button className="px-4 py-2 rounded-lg bg-blue-500 text-white" onClick={confirmEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 bg-white/80 rounded-xl px-4 py-3 shadow-sm border">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleToday}
            className="ml-2 px-3 py-1.5 text-xs font-medium border rounded-full hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <h2 className="ml-4 text-lg font-semibold text-gray-800">{monthLabel}</h2>
        </div>
        <div className="text-xs text-gray-500 md:block hidden">Click any day to add and manage tasks.</div>
      </div>

      <div className="bg-white/80 rounded-2xl shadow-md border overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-gray-50/80">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="text-center py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[90px]">
          {daysGrid.map(({ date, inCurrentMonth }) => {
            const key = formatKey(date);
            const dayTasks = tasksByDate[key] || [];
            const visibleTasks = dayTasks.slice(0, 2);
            const remainingCount = dayTasks.length - visibleTasks.length;
            const isToday = isSameDay(date, today);

            const baseButtonClasses =
              "relative border-t border-l last:border-r px-1.5 py-1 text-left group transition-colors";
            const stateClasses = !inCurrentMonth ? "bg-gray-50 text-gray-400 hover:bg-gray-100" : "bg-white hover:bg-blue-50/70";

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(date, inCurrentMonth)}
                className={[baseButtonClasses, stateClasses].join(" ")}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={[
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                      isToday ? "bg-blue-600 text-white" : "text-gray-700",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </div>
                </div>

                <div className="space-y-0.5">
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md truncate ${task.completed ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {remainingCount > 0 && <div className="text-[10px] text-gray-500">+{remainingCount} more</div>}
                  {dayTasks.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      Add task
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isDialogOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button onClick={handleCloseDialog} className="text-xs text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedTasks.length === 0 ? (
                <p className="text-xs text-gray-400">No tasks for this day yet.</p>
              ) : (
                selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 text-sm px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800"
                  >
                    <label className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => toggleComplete(task.id, e.target.checked)}
                      />
                      <span className={`truncate ${task.completed ? "line-through text-green-700" : ""}`}>{task.title}</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => editTask_open(task.id, task.title, task.dueDate || "")} className="p-1 rounded-full hover:bg-blue-100">
                        <SquarePen className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => deleteTask(task.id)} className="p-1 rounded-full hover:bg-red-100 text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500"
              />
              <button
                onClick={handleAddTask}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={!newTaskTitle.trim()}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
