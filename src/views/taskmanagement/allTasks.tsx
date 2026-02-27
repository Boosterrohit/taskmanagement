import { Button } from "@/components/ui/button";
import { ChevronRight, Lock, Plus, Trash2, User2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState, useRef } from "react";

type Task = {
  id: string;
  text: string;
  date: string;
  assignee: string;
};

type Column = "today" | "tomorrow" | "upcoming" | "someday";

type TasksState = Record<Column, Task[]>;

const initialTasks: TasksState = {
  today: [
    { id: "t1", text: "Complete the project documentation", date: "2026-02-27", assignee: "Rohit" },
  ],
  tomorrow: [
    { id: "t2", text: "Review pull requests", date: "2026-02-28", assignee: "Rohit" },
  ],
  upcoming: [
    { id: "t3", text: "Team standup meeting", date: "2026-03-01", assignee: "Rohit" },
  ],
  someday: [
    { id: "t4", text: "Refactor authentication module", date: "2026-03-05", assignee: "Rohit" },
  ],
};

const columnLabels: Record<Column, { title: string; day: string }> = {
  today: { title: "Today", day: "Friday" },
  tomorrow: { title: "Tomorrow", day: "Saturday" },
  upcoming: { title: "Upcoming", day: "Monday" },
  someday: { title: "Someday", day: "Anytime" },
};

const AllTasks = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [tasks, setTasks] = useState<TasksState>(initialTasks);
  const [inputs, setInputs] = useState<Record<Column, string>>({
    today: "", tomorrow: "", upcoming: "", someday: "",
  });
  const [dateInputs, setDateInputs] = useState<Record<Column, string>>({
    today: "", tomorrow: "", upcoming: "", someday: "",
  });
  const [fromDate] = useState("");
  const [toDate] = useState("");

  const dragItem = useRef<{ task: Task; from: Column } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Column | null>(null);

  const handleDragStart = (task: Task, from: Column) => {
    dragItem.current = { task, from };
  };

  const handleDrop = (to: Column) => {
    if (!dragItem.current) return;
    const { task, from } = dragItem.current;
    if (from === to) return;

    setTasks((prev) => ({
      ...prev,
      [from]: prev[from].filter((t) => t.id !== task.id),
      [to]: [...prev[to], task],
    }));
    dragItem.current = null;
    setDragOverCol(null);
  };

  const handleAddTask = (col: Column) => {
    const text = inputs[col].trim();
    if (!text) return;
    const newTask: Task = {
      id: `${col}-${Date.now()}`,
      text,
      date: dateInputs[col] || new Date().toISOString().split("T")[0],
      assignee: "Rohit",
    };
    setTasks((prev) => ({ ...prev, [col]: [...prev[col], newTask] }));
    setInputs((prev) => ({ ...prev, [col]: "" }));
    setDateInputs((prev) => ({ ...prev, [col]: "" }));
  };

  const handleDeleteTask = (col: Column, id: string) => {
    setTasks((prev) => ({ ...prev, [col]: prev[col].filter((t) => t.id !== id) }));
  };

  const getFilteredTasks = (col: Column) => {
    return tasks[col].filter((task) => {
      if (fromDate && task.date < fromDate) return false;
      if (toDate && task.date > toDate) return false;
      return true;
    });
  };

  return (
    <section className="">
      <div>
        {activeTab === "overview" && (
          <div className="h-[85vh] overflow-auto flex md:flex-row flex-col gap-7">
            <div className="flex md:w-[80%] md:h-[85vh] min-h-[400px]  relative overflow-hidden flex-col gap-4 bg-white shadow-lg p-6 border-2 rounded-xl">
              <div className="md:h-[68vh] h-[600px] hide-scrollbar overflow-y-scroll">
                <ul>
                  <span className="text-xl font-bold">Today</span>
                  <li className="bg-white p-2 border mt-2 shadow-md rounded-lg">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <div className="flex flex-col">
                        <p>Complete the project documentation</p>
                        <span className="text-xs text-gray-400">2026-02-27</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="absolute bottom-0 py-3 bg-white left-0 w-full px-5">
                <div className="rounded-full overflow-hidden border shadow-md">
                  <input
                    type="text"
                    placeholder="Add tasks..."
                    className="rounded-md h-14 px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="absolute right-7 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center">
                    <Plus size={22} />Add
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white relative w-full rounded-xl shadow-lg p-6 border-2">
              <div className="flex justify-between items-center">
                <p className="md:flex hidden items-center text-sm gap-2 text-gray-500">
                  <Lock size={15} /> My List <ChevronRight size={15} /> Personal
                </p>
                <div className="flex items-center">
                  <span className="bg-white shadow-md text-xs p-1 border rounded-full text-gray-500">
                    Mark As Complete
                  </span>
                  <Trash2 size={18} color="red" className="ml-2 cursor-pointer" />
                </div>
              </div>
              <div className="my-8">
                <h1 className="text-2xl font-bold">Complete the project documentation</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">2026-02-27</p>
                  <p className="text-xs text-gray-400">|</p>
                  <p className="text-xs text-gray-400">Assigned to: Rohit</p>
                </div>
              </div>
              <div>
                <textarea
                  className="w-full hide-scrollbar h-32 p-3 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add a Note..."
                />
                <Button className="bg-blue-500 hover:bg-blue-600 mt-5">
                  <Plus /> Add SubTask
                </Button>
              </div>
              <div className="absolute bottom-5 w-full left-0 px-6 md:grid hidden grid-cols-3  gap-3">
                <div className="bg-white rounded-md w-full border-2 border-green-400 p-4">
                  <h4 className="text-xl font-semibold">Subtasks</h4>
                  <span className="text-base font-bold text-gray-500">2</span>
                </div>
                <div className="bg-white rounded-md w-full border-2 border-blue-400 p-4">
                  <h4 className="text-xl font-semibold">Tasks</h4>
                  <span className="text-base font-bold text-gray-500">2</span>
                </div>
                <div className="bg-white rounded-md w-full border-2 border-red-400 p-4">
                  <h4 className="text-xl font-semibold">Completed</h4>
                  <span className="text-base font-bold text-gray-500">2</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            {/* Kanban Columns */}
            <div className="flex hide-scrollbar items-start gap-6 w-full overflow-x-auto pb-4">
              {(Object.keys(columnLabels) as Column[]).map((col) => (
                <div
                  key={col}
                  className={`bg-white shadow-lg min-h-[500px] w-[350px] shrink-0 flex flex-col p-5 rounded-3xl transition-all duration-200 ${
                    dragOverCol === col ? "ring-2 ring-blue-400 bg-blue-50" : ""
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={() => handleDrop(col)}
                >
                  <div className="flex-1 overflow-y-auto">
                    <p className="flex gap-2 items-center mb-2">
                      <span className="text-xl font-bold text-black">{columnLabels[col].title}</span>
                      <span className="text-xl font-bold text-gray-300">{columnLabels[col].day}</span>
                    </p>

                    <ul className="space-y-3">
                      {getFilteredTasks(col).length === 0 && (
                        <li className="text-center text-gray-300 text-sm py-8 border-2 border-dashed rounded-2xl">
                          Drop tasks here
                        </li>
                      )}
                      {getFilteredTasks(col).map((task) => (
                        <li
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task, col)}
                          className="bg-white border shadow-md p-3 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-200 select-none"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-0.5 text-gray-400 text-xs">
                              <User2 size={11} /> {task.assignee}
                            </span>
                            <Trash2
                              size={16}
                              color="red"
                              className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteTask(col, task.id)}
                            />
                          </div>
                          <p className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-0.5 shrink-0" />
                            <span>{task.text}</span>
                          </p>
                          <span className="text-xs text-gray-400 mt-1 block">{task.date}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Add tasks..."
                        value={inputs[col]}
                        onChange={(e) => setInputs((prev) => ({ ...prev, [col]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTask(col)}
                        className="rounded-full h-11 px-4 py-2 w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={() => handleAddTask(col)}
                        className="absolute right-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1 text-sm"
                      >
                        <Plus size={16} />Add
                      </button>
                    </div>
                    <input
                      type="date"
                      value={dateInputs[col]}
                      onChange={(e) => setDateInputs((prev) => ({ ...prev, [col]: e.target.value }))}
                      className="w-full text-sm border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllTasks;