// import {
//   Plus,
//   Trash2,
//   Bell,
//   Tag,
//   ClipboardList,
//   Lock,
//   ChevronRight,
//   SquarePen,
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useTasks } from "@/contexts/taskContext";
// import { useToast } from "@/contexts/toastContext";
// import type { TaskListType, TaskSubtask } from "@/types/task";
// import select from "../../assets/select.jpg";
// import noTask from "../../assets/noTask.jpg";

// interface ListPageProps {
//   title: string;
// }

// const listTypeByTitle: Record<string, TaskListType> = {
//   Personal: "personal",
//   Work: "work",
//   Groceries: "groceries",
// };

// const ListPage = ({ title }: ListPageProps) => {
//   const { getTasksByListType, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
//   const { showSuccess, showError } = useToast();
//   const listType = listTypeByTitle[title] || "personal";

//   const tasks = getTasksByListType(listType);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [inputText, setInputText] = useState("");
//   const [inputDate, setInputDate] = useState("");
//   const [subtaskText, setSubtaskText] = useState("");
//   const [noteDraft, setNoteDraft] = useState("");
//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [isSavingEdit, setIsSavingEdit] = useState(false);

//   // edit dialog state
//   const [editTask, setEditTask] = useState<{ id: string; title: string; dueDate: string } | null>(null);

//   const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
//   const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);
//   const selectedTask = tasks.find((task) => task.id === selectedId) || null;

//   useEffect(() => {
//     setSelectedId(null);
//   }, [title]);

//   useEffect(() => {
//     setNoteDraft(selectedTask?.notes || "");
//   }, [selectedTask?.id, selectedTask?.notes]);

//   const handleAdd = async () => {
//     const text = inputText.trim();
//     if (!text) return;

//     setIsAddingTask(true);
//     try {
//       const newTask = await addTask({
//         title: text,
//         listType,
//         dueDate: inputDate || null,
//         completed: false,
//         notes: "",
//         subtasks: [],
//         bucket: null,
//       });

//       setInputText("");
//       setInputDate("");
//       setSelectedId(newTask.id);
//       showSuccess("Task added");
//     } catch {
//       showError("Failed to add task");
//     } finally {
//       setIsAddingTask(false);
//     }
//   };

//   const editTaskTitle = (id: string, currentTitle: string, currentDueDate: string | null) => {
//     setEditTask({ id, title: currentTitle, dueDate: currentDueDate || "" });
//   };

//   const confirmEdit = async () => {
//     if (!editTask) return;
//     const trimmed = editTask.title.trim();
//     if (!trimmed) return;
//     setIsSavingEdit(true);
//     try {
//       await updateTask(editTask.id, { title: trimmed, dueDate: editTask.dueDate || null });
//       setEditTask(null);
//       showSuccess("Task updated");
//     } catch {
//       showError("Failed to update task");
//     } finally {
//       setIsSavingEdit(false);
//     }
//   };

//   const handleDeleteTask = async (id: string) => {
//     try {
//       await deleteTask(id);
//       if (selectedId === id) setSelectedId(null);
//       showSuccess("Task deleted");
//     } catch {
//       showError("Failed to delete task");
//     }
//   };

//   const addSubtask = async (taskId: string) => {
//     const text = subtaskText.trim();
//     if (!text || !selectedTask) return;

//     const nextSubtasks: TaskSubtask[] = [
//       ...(selectedTask.subtasks || []),
//       { id: `${Date.now()}`, text, completed: false },
//     ];

//     await updateTask(taskId, { subtasks: nextSubtasks });
//     setSubtaskText("");
//   };

//   const toggleSubtask = async (taskId: string, subId: string) => {
//     if (!selectedTask) return;

//     const nextSubtasks = (selectedTask.subtasks || []).map((subtask) =>
//       subtask.id === subId ? { ...subtask, completed: !subtask.completed } : subtask
//     );

//     await updateTask(taskId, { subtasks: nextSubtasks });
//   };

//   const saveNotes = async () => {
//     if (!selectedTask) return;
//     await updateTask(selectedTask.id, { notes: noteDraft });
//   };

//   return (
//     <section className="h-[85vh] flex items-center gap-4 ">
//       {/* Edit task dialog */}
//       {editTask && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-xl shadow-xl w-80">
//             <h2 className="text-lg font-semibold mb-3">Edit Task</h2>
//             <input
//               type="text"
//               value={editTask.title}
//               onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
//               onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
//               className="w-full border px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               placeholder="Task title"
//               autoFocus
//             />
//             <label className="text-xs text-gray-500 mb-1 block">Due date</label>
//             <input
//               type="date"
//               value={editTask.dueDate}
//               onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
//               className="w-full border px-3 py-2 rounded-lg mb-4"
//             />
//             <div className="flex justify-end gap-2">
//               <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setEditTask(null)}>Cancel</button>
//               <button className="px-4 py-2 rounded-lg bg-blue-500 text-white" onClick={confirmEdit} disabled={isSavingEdit}>{isSavingEdit ? "Saving..." : "Save"}</button>
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="w-full border-r overflow-y-auto p-4 relative bg-white shadow-lg rounded-lg h-[550px]">
//         <h1 className="text-2xl font-bold mb-4">{title}</h1>
//         <ul className="space-y-2 hide-scrollbar h-[300px] rounded-lg p-2 overflow-y-auto">
//           {activeTasks.length > 0 ? (
//   activeTasks.map((task) => (
//     <li
//       key={task.id}
//       onClick={() => setSelectedId(task.id)}
//       className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
//         selectedId === task.id ? "bg-blue-50" : "border shadow-md"
//       }`}
//     >
//       <div className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           checked={task.completed}
//           onChange={(e) => {
//             e.stopPropagation();
//             toggleComplete(task.id, e.target.checked);
//           }}
//           className="mr-2"
//         />

//         <span className="text-gray-700">{task.title}</span>
//       </div>

//       <div className="flex items-center gap-2">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             editTaskTitle(task.id, task.title, task.dueDate);
//           }}
//         >
//           <SquarePen size={16} className="text-blue-600" />
//         </button>

//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             handleDeleteTask(task.id);
//           }}
//         >
//           <Trash2
//             size={18}
//             color="red"
//             className="opacity-60 hover:opacity-100"
//           />
//         </button>
//       </div>
//     </li>
//   ))
// ) : (
//   <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4">
//                 <img
//                   src={noTask}
//                   alt="No tasks"
//                   className="h-auto md:w-full md:max-w-64 w-2/5 opacity-75 object-contain"
//                 />
//                 <p className="text-gray-600 md:mt-4 font-bold">No {title} tasks in My Day.</p>
//                 <p className="md:text-sm text-xs md:mt-2 text-gray-500">Looks like you're all caught up!</p>
//               </div>
// )}
//           {completedTasks.length > 0 && (
//             <div className="mt-6">
//               <h2 className="text-xl font-semibold">Completed</h2>
//               <ul className="space-y-2 mt-2">
//                 {completedTasks.map((task) => (
//                   <li key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
//                     <div className="flex items-center gap-2">
//                       <button className="text-xs text-blue-600" onClick={() => toggleComplete(task.id, false)}>
//                         Reopen
//                       </button>
//                       <del className="text-gray-500">{task.title}</del>
//                     </div>
//                     <button onClick={() => handleDeleteTask(task.id)}>
//                       <Trash2 size={18} color="red" className="opacity-60 hover:opacity-100" />
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </ul>

//         <div className="bottom-4 bg-white border absolute pl-3 pr-3 left-1/2 -translate-x-1/2 w-[90%] py-2 rounded-xl">
//           <div className="flex items-center justify-between gap-2">
//             <input
//               type="text"
//               placeholder="Add task..."
//               value={inputText}
//               onChange={(e) => setInputText(e.target.value)}
//               className="flex-1 rounded-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//             />

//             <button onClick={handleAdd} disabled={isAddingTask || !inputText.trim()} className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center gap-1">
//               <Plus size={20} />{isAddingTask ? "Adding..." : "Add"}
//             </button>
//           </div>
//           <input
//             type="date"
//             value={inputDate}
//             onChange={(e) => setInputDate(e.target.value)}
//             className="h-10 w-full mt-2 text-sm border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500 cursor-pointer"
//           />
//         </div>
//       </div>

//       <div className="w-full px-1 py-5 overflow-y-scroll hide-scrollbar rounded-lg shadow-lg border h-[550px] bg-white flex justify-center ">
//         {selectedTask ? (
//           <div className="mb-4 w-full px-4">
//             <div className="mb-3 text-sm text-gray-500 flex items-center gap-1">
//               <Lock size={14} /> My lists <ChevronRight size={14} /> {title}
//             </div>
//             <div className="flex justify-between items-center">
//               <h2 className="text-3xl font-bold">{selectedTask.title}</h2>
//               <div className="flex items-center gap-2">
//                 <button className="text-sm text-blue-500 hover:underline" onClick={() => toggleComplete(selectedTask.id, !selectedTask.completed)}>
//                   {selectedTask.completed ? "Mark as incomplete" : "Mark as complete"}
//                 </button>
//                 <button onClick={() => editTaskTitle(selectedTask.id, selectedTask.title, selectedTask.dueDate)}>
//                   <SquarePen size={18} className="text-blue-600" />
//                 </button>
//               </div>
//             </div>
//             <p className="text-xs text-gray-400 mt-1">{selectedTask.dueDate || "No due date"}</p>
//             <div className="mt-2 flex gap-2 flex-wrap">
//               <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
//                 <Bell size={16} /> Remind me
//               </button>
//               <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
//                 <ClipboardList size={16} /> {title} List
//               </button>
//               <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
//                 <Tag size={16} /> Tags
//               </button>
//             </div>
//             <div className="mt-6">
//               <h3 className="font-semibold mb-1">Notes</h3>
//               <textarea
//                 className="w-full h-24 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 value={noteDraft}
//                 onChange={(e) => setNoteDraft(e.target.value)}
//                 placeholder="Insert your notes here"
//               />
//               <button onClick={saveNotes} className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
//                 Save Notes
//               </button>
//             </div>
//             <div className="mt-6 py-5">
//               <h3 className="font-semibold mb-1">
//                 Subtasks <span className="text-sm text-gray-500">{selectedTask.subtasks?.length || 0}</span>
//               </h3>
//               <ul className="space-y-2">
//                 {selectedTask.subtasks?.map((st) => (
//                   <li key={st.id} className="flex items-center gap-2">
//                     <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(selectedTask.id, st.id)} />
//                     <span className={st.completed ? "line-through text-gray-500" : ""}>{st.text}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className="mt-2 flex items-center gap-2">
//                 <input
//                   type="text"
//                   placeholder="Add a new subtask"
//                   value={subtaskText}
//                   onChange={(e) => setSubtaskText(e.target.value)}
//                   className="flex-1 rounded-full border px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   onKeyDown={(e) => e.key === "Enter" && addSubtask(selectedTask.id)}
//                 />
//                 <button onClick={() => addSubtask(selectedTask.id)} className="text-blue-500 hover:underline">
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//             <div className="w-full px-3">
//                 <p className="text-gray-700 font-semibold ">Select a task to see details.</p>
//                 <p className="text-sm text-gray-400 py-1">Choose a task from the list to view its <br/> information and updates here.</p>
//                 <div className="flex flex-col items-center justify-center mt-20">
//                    <img
//                   src={select}
//                   alt="Task Details"
//                   className="h-auto md:w-full md:max-w-64 w-2/5 opacity-90 -mt-5 object-contain"
//                 />
//                 <p className="text-gray-600 font-semibold my-1 text-sm mt-3">No task selected yet.</p>
//                 <p className="text-gray-400 text-center text-sm">Please select a task to see its details, <br/>comments, and activity.</p>
//                 </div>
//               </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default ListPage;

import {
  Plus,
  Trash2,
  Bell,
  Tag,
  ClipboardList,
  Lock,
  ChevronRight,
  SquarePen,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTasks } from "@/contexts/taskContext";
import { useToast } from "@/contexts/toastContext";
import type { TaskListType, TaskSubtask } from "@/types/task";
import select from "../../assets/select.jpg";
import noTask from "../../assets/noTask.jpg";

interface ListPageProps {
  title: string;
}

const listTypeByTitle: Record<string, TaskListType> = {
  Personal: "personal",
  Work: "work",
  Groceries: "groceries",
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  pill?: boolean;
}

const PANEL_WIDTH = 288;

const DatePicker = ({ value, onChange, className = "", pill = true }: DatePickerProps) => {
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
    const openUp = spaceAbove > 340 || spaceAbove > spaceBelow;
    let left = rect.left;
    if (left + PANEL_WIDTH > window.innerWidth - 8) left = window.innerWidth - PANEL_WIDTH - 8;
    if (left < 8) left = 8;
    setCoords({ left, anchorTop: rect.top, anchorBottom: rect.bottom, openUp });
  };

  useEffect(() => {
    if (!open) return;
    computePosition();
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
        className={`flex items-center gap-2 h-10 px-3 py-2 border text-left transition-colors ${
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

const ListPage = ({ title }: ListPageProps) => {
  const { getTasksByListType, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const { showSuccess, showError } = useToast();
  const listType = listTypeByTitle[title] || "personal";

  const tasks = getTasksByListType(listType);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [subtaskText, setSubtaskText] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // edit dialog state
  const [editTask, setEditTask] = useState<{ id: string; title: string; dueDate: string } | null>(null);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);
  const selectedTask = tasks.find((task) => task.id === selectedId) || null;

  useEffect(() => {
    setSelectedId(null);
  }, [title]);

  useEffect(() => {
    setNoteDraft(selectedTask?.notes || "");
  }, [selectedTask?.id, selectedTask?.notes]);

  const handleAdd = async () => {
    const text = inputText.trim();
    if (!text) return;
    if (!inputDate) {
      showError("Please select a due date before adding a task");
      return;
    }

    setIsAddingTask(true);
    try {
      const newTask = await addTask({
        title: text,
        listType,
        dueDate: inputDate,
        completed: false,
        notes: "",
        subtasks: [],
        bucket: null,
      });

      setInputText("");
      setInputDate("");
      setSelectedId(newTask.id);
      showSuccess("Task added");
    } catch {
      showError("Failed to add task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const editTaskTitle = (id: string, currentTitle: string, currentDueDate: string | null) => {
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

  const addSubtask = async (taskId: string) => {
    const text = subtaskText.trim();
    if (!text || !selectedTask) return;

    const nextSubtasks: TaskSubtask[] = [
      ...(selectedTask.subtasks || []),
      { id: `${Date.now()}`, text, completed: false },
    ];

    await updateTask(taskId, { subtasks: nextSubtasks });
    setSubtaskText("");
  };

  const toggleSubtask = async (taskId: string, subId: string) => {
    if (!selectedTask) return;

    const nextSubtasks = (selectedTask.subtasks || []).map((subtask) =>
      subtask.id === subId ? { ...subtask, completed: !subtask.completed } : subtask
    );

    await updateTask(taskId, { subtasks: nextSubtasks });
  };

  const saveNotes = async () => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, { notes: noteDraft });
  };

  return (
    <section className="h-[85vh] flex items-center gap-4 ">
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
      <div className="w-full border-r overflow-y-auto p-4 relative bg-white shadow-lg rounded-lg h-[550px]">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <ul className="space-y-2 hide-scrollbar h-[300px] rounded-lg p-2 overflow-y-auto">
          {activeTasks.length > 0 ? (
  activeTasks.map((task) => (
    <li
      key={task.id}
      onClick={() => setSelectedId(task.id)}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
        selectedId === task.id ? "bg-blue-50" : "border shadow-md"
      }`}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
            e.stopPropagation();
            toggleComplete(task.id, e.target.checked);
          }}
          className="mr-2"
        />

        <span className="text-gray-700">{task.title}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            editTaskTitle(task.id, task.title, task.dueDate);
          }}
        >
          <SquarePen size={16} className="text-blue-600" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTask(task.id);
          }}
        >
          <Trash2
            size={18}
            color="red"
            className="opacity-60 hover:opacity-100"
          />
        </button>
      </div>
    </li>
  ))
) : (
  <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4">
                <img
                  src={noTask}
                  alt="No tasks"
                  className="h-auto md:w-full md:max-w-64 w-2/5 opacity-75 object-contain"
                />
                <p className="text-gray-600 md:mt-4 font-bold">No {title} tasks in My Day.</p>
                <p className="md:text-sm text-xs md:mt-2 text-gray-500">Looks like you're all caught up!</p>
              </div>
)}
          {completedTasks.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Completed</h2>
              <ul className="space-y-2 mt-2">
                {completedTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-600" onClick={() => toggleComplete(task.id, false)}>
                        Reopen
                      </button>
                      <del className="text-gray-500">{task.title}</del>
                    </div>
                    <button onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 size={18} color="red" className="opacity-60 hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ul>

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

            <button onClick={handleAdd} disabled={isAddingTask || !inputText.trim() || !inputDate} className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus size={20} />{isAddingTask ? "Adding..." : "Add"}
            </button>
          </div>
          <DatePicker value={inputDate} onChange={setInputDate} className="w-full mt-2" />
        </div>
      </div>

      <div className="w-full px-1 py-5 overflow-y-scroll hide-scrollbar rounded-lg shadow-lg border h-[550px] bg-white flex justify-center ">
        {selectedTask ? (
          <div className="mb-4 w-full px-4">
            <div className="mb-3 text-sm text-gray-500 flex items-center gap-1">
              <Lock size={14} /> My lists <ChevronRight size={14} /> {title}
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{selectedTask.title}</h2>
              <div className="flex items-center gap-2">
                <button className="text-sm text-blue-500 hover:underline" onClick={() => toggleComplete(selectedTask.id, !selectedTask.completed)}>
                  {selectedTask.completed ? "Mark as incomplete" : "Mark as complete"}
                </button>
                <button onClick={() => editTaskTitle(selectedTask.id, selectedTask.title, selectedTask.dueDate)}>
                  <SquarePen size={18} className="text-blue-600" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{selectedTask.dueDate || "No due date"}</p>
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
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Insert your notes here"
              />
              <button onClick={saveNotes} className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                Save Notes
              </button>
            </div>
            <div className="mt-6 py-5">
              <h3 className="font-semibold mb-1">
                Subtasks <span className="text-sm text-gray-500">{selectedTask.subtasks?.length || 0}</span>
              </h3>
              <ul className="space-y-2">
                {selectedTask.subtasks?.map((st) => (
                  <li key={st.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(selectedTask.id, st.id)} />
                    <span className={st.completed ? "line-through text-gray-500" : ""}>{st.text}</span>
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
                <button onClick={() => addSubtask(selectedTask.id)} className="text-blue-500 hover:underline">
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
            <div className="w-full px-3">
                <p className="text-gray-700 font-semibold ">Select a task to see details.</p>
                <p className="text-sm text-gray-400 py-1">Choose a task from the list to view its <br/> information and updates here.</p>
                <div className="flex flex-col items-center justify-center mt-20">
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
      </div>
    </section>
  );
};

export default ListPage;