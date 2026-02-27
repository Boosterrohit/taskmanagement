
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

type CalendarTask = {
  id: number;
  title: string;
};

type TasksByDate = Record<string, CalendarTask[]>;

type Holiday = {
  date: string; // YYYY-MM-DD
  name: string;
};

// Example Nepali holidays in Gregorian dates.
// TODO: Adjust/update dates per year based on your official Nepali holiday calendar.
const NEPALI_HOLIDAYS: Holiday[] = [
  { date: "2026-04-13", name: "Nepali New Year" },
  { date: "2026-10-20", name: "Dashain (Vijaya Dashami)" },
  { date: "2026-11-08", name: "Tihar (Laxmi Puja)" },
  { date: "2026-11-09", name: "Tihar (Bhai Tika)" },
];

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

const getHolidayForDate = (date: Date): Holiday | undefined => {
  const key = formatKey(date);
  return NEPALI_HOLIDAYS.find((h) => h.date === key);
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [tasksByDate, setTasksByDate] = useState<TasksByDate>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const today = useMemo(() => new Date(), []);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth]);

  const daysGrid = useMemo(() => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const startDay = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = endOfMonth.getDate();

    const cells: {
      date: Date;
      inCurrentMonth: boolean;
    }[] = [];

    // Previous month's trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1 - i - 1
      );
      cells.push({ date: d, inCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      cells.push({ date: d, inCurrentMonth: true });
    }

    // Next month's leading days to fill 6 rows (6 * 7 = 42)
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      cells.push({ date: d, inCurrentMonth: false });
    }

    return cells;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
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
      setCurrentMonth(
        new Date(cellDate.getFullYear(), cellDate.getMonth(), 1)
      );
    }
    openDialogForDate(cellDate);
  };

  const handleAddTask = () => {
    if (!selectedDate || !newTaskTitle.trim()) return;
    const key = formatKey(selectedDate);
    setTasksByDate((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        {
          id: Date.now(),
          title: newTaskTitle.trim(),
        },
      ],
    }));
    setNewTaskTitle("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (taskId: number) => {
    if (!selectedDate) return;
    const key = formatKey(selectedDate);
    setTasksByDate((prev) => {
      const existing = prev[key] || [];
      const updated = existing.filter((t) => t.id !== taskId);
      if (updated.length === 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  const selectedKey = selectedDate ? formatKey(selectedDate) : null;
  const selectedTasks = selectedKey ? tasksByDate[selectedKey] || [] : [];
  const selectedHoliday = selectedDate ? getHolidayForDate(selectedDate) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-white/80 rounded-xl px-4 py-3 shadow-sm border">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleToday}
            className="ml-2 px-3 py-1.5 text-xs font-medium border rounded-full hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <h2 className="ml-4 text-lg font-semibold text-gray-800">
            {monthLabel}
          </h2>
        </div>
        <div className="text-xs text-gray-500 md:block hidden">
          Click any day box to add tasks. Nepali holidays are highlighted in red.
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl shadow-md border overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-gray-50/80">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-center py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[90px]">
          {daysGrid.map(({ date, inCurrentMonth }) => {
            const key = formatKey(date);
            const isToday = isSameDay(date, today);
            const holiday = getHolidayForDate(date);
            const tasks = tasksByDate[key] || [];
            const visibleTasks = tasks.slice(0, 2);
            const remainingCount = tasks.length - visibleTasks.length;
            const isSaturday = date.getDay() === 6;

            const todayOnly = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const dateOnly = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            );
            const isPast = dateOnly < todayOnly;

            const baseButtonClasses =
              "relative border-t border-l last:border-r px-1.5 py-1 text-left group transition-colors";

            const stateClasses = !inCurrentMonth
              ? "bg-gray-50 text-gray-400 hover:bg-gray-100"
              : isPast && !isToday
              ? "bg-gray-100 text-gray-400 cursor-default"
              : holiday
              ? "bg-red-50 hover:bg-red-100"
              : "bg-white hover:bg-blue-50/70";

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
                      isToday
                        ? "bg-blue-600 text-white"
                        : holiday
                        ? "text-red-500"
                        : isSaturday
                        ? "text-red-500"
                        : "text-gray-700",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </div>
                  {holiday && (
                    <span className="ml-1 text-[10px] font-medium text-red-500 truncate max-w-[72px]">
                      {holiday.name}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 truncate"
                    >
                      {task.title}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="text-[10px] text-gray-500">
                      +{remainingCount} more
                    </div>
                  )}
                  {tasks.length === 0 && (
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
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {selectedHoliday && (
                  <p className="mt-1 text-xs font-semibold text-red-500">
                    {selectedHoliday.name}
                  </p>
                )}
              </div>
              <button
                onClick={handleCloseDialog}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedTasks.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No tasks for this day yet.
                </p>
              ) : (
                selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 text-sm px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800"
                  >
                    <span className="flex-1 truncate">{task.title}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="inline-flex items-center justify-center p-1 rounded-full text-xs text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task (like Google Calendar)…"
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