import {
  Plus,
  Trash2,
  Bell,
  Tag,
  ClipboardList,
  Lock,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";

type Subtask = { id: string; text: string; completed: boolean };

type Task = {
  id: string;
  text: string;
  date: string;
  completed: boolean;
  notes?: string;
  subtasks?: Subtask[];
  attachments?: string[];
};

interface ListPageProps {
  title: string;
}

const ListPage = ({ title }: ListPageProps) => {
  const [tasksByList, setTasksByList] = useState<Record<string, Task[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [subtaskText, setSubtaskText] = useState("");

  // helper to update current list
  const updateList = (updater: (tasks: Task[]) => Task[]) => {
    setTasksByList((prev) => {
      const curr = prev[title] || [];
      return { ...prev, [title]: updater(curr) };
    });
  };

  const handleAdd = () => {
    const text = inputText.trim();
    if (!text) return;
    const newTask: Task = {
      id: `${Date.now()}`,
      text,
      date: inputDate || new Date().toISOString().split("T")[0],
      completed: false,
      notes: "",
      subtasks: [],
      attachments: [],
    };
    updateList((prev) => [...prev, newTask]);
    setInputText("");
    setInputDate("");
    setSelectedId(newTask.id);
  };

  const toggleComplete = (id: string) => {
    updateList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id: string) => {
    updateList((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const setNotes = (id: string, notes: string) => {
    updateList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, notes } : t))
    );
  };

  const addSubtask = (taskId: string) => {
    const text = subtaskText.trim();
    if (!text) return;
    updateList((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...(t.subtasks || []),
                { id: `${Date.now()}`, text, completed: false },
              ],
            }
          : t
      )
    );
    setSubtaskText("");
  };

  const toggleSubtask = (taskId: string, subId: string) => {
    updateList((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subId ? { ...s, completed: !s.completed } : s
          ),
        };
      })
    );
  };

  const tasks = tasksByList[title] || [];
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const selectedTask = tasks.find((t) => t.id === selectedId) || null;

  // clear selection when switching between lists
  React.useEffect(() => {
    setSelectedId(null);
  }, [title]);

  return (
    <section className="h-[85vh] flex items-center gap-4 ">
      {/* left list pane */}
      <div className="w-full border-r overflow-y-auto p-4 relative bg-white shadow-lg rounded-lg h-[500px]">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <ul className="space-y-2 hide-scrollbar h-[300px] rounded-lg p-2 overflow-y-auto">
          {activeTasks.map((task) => (
            <li
              key={task.id}
              onClick={() => setSelectedId(task.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedId === task.id ? "bg-blue-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleComplete(task.id);
                  }}
                  className="mr-2"
                />
                <span className="text-gray-700">{task.text}</span>
              </div>
              <Trash2
                size={18}
                color="red"
                className="opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
              />
            </li>
          ))}
          {completedTasks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Completed</h2>
            <ul className="space-y-2 mt-2">
              {completedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100"
                >
                  <del className="text-gray-500">{task.text}</del>
                  <Trash2
                    size={18}
                    color="red"
                    className="opacity-60 hover:opacity-100"
                    onClick={() => deleteTask(task.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        </ul>
        

        {/* add input */}
        <div className="bottom-4 bg-white border absolute pl-3 pr-3 left-1/2 -translate-x-1/2 w-[90%] py-2 rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Add task..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          
            <button
              onClick={handleAdd}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center"
            >
              <Plus size={20} />
            </button>
          </div>
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="h-10 w-full mt-2 text-sm border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500 cursor-pointer"
            />
        </div>
      </div>

      {/* right detail pane */}
      <div className="w-full px-1 py-5 overflow-y-scroll hide-scrollbar rounded-lg shadow-lg border h-[500px] bg-white flex justify-center ">
        {selectedTask ? (
          <div className="mb-4">
            <div className="mb-3 text-sm text-gray-500 flex items-center gap-1">
              <Lock size={14} /> My lists <ChevronRight size={14} /> {title}
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{selectedTask.text}</h2>
              <button
                className="text-sm text-blue-500 hover:underline"
                onClick={() => toggleComplete(selectedTask.id)}
              >
                {selectedTask.completed ? "Mark as incomplete" : "Mark as complete"}
              </button>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <Bell size={16} /> Remind me
              </button>
              <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <ClipboardList size={16} /> {title} List
              </button>
              <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <Tag size={16} /> Tags
              </button>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-1">Notes</h3>
              <textarea
                className="w-full h-24 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={selectedTask.notes || ""}
                onChange={(e) => setNotes(selectedTask.id, e.target.value)}
                placeholder="Insert your notes here"
              />
            </div>
            <div className="mt-6 py-5">
              <h3 className="font-semibold mb-1">
                Subtasks {" "}
                <span className="text-sm text-gray-500">
                  {selectedTask.subtasks?.length || 0}
                </span>
              </h3>
              <ul className="space-y-2">
                {selectedTask.subtasks?.map((st) => (
                  <li key={st.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(selectedTask.id, st.id)}
                    />
                    <span className={st.completed ? "line-through text-gray-500" : ""}>
                      {st.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a new subtask"
                  value={subtaskText}
                  onChange={(e) => setSubtaskText(e.target.value)}
                  className="flex-1 rounded-full border px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && addSubtask(selectedTask.id)}
                />
                <button
                  onClick={() => addSubtask(selectedTask.id)}
                  className="text-blue-500 hover:underline"
                >
                  Add
                </button>
              </div>
            </div>
            
          </div>
        ) : (
          <p className="text-gray-500">Select a task to see details</p>
        )}
      </div>
    </section>
  );
};

export default ListPage;
