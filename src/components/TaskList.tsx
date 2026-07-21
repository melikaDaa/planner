import React from "react";
import { TaskItem } from "../types";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";

interface TaskListProps {
  tasks: TaskItem[];
  onChange: (updated: TaskItem[]) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onChange
}) => {
  const [newText, setNewText] = React.useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      completed: false
    };

    onChange([...tasks, newTask]);
    setNewText("");
  };

  const handleToggle = (id: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    onChange(updated);
  };

  return (
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="flex items-center gap-2 mb-4">
        <ListTodo size={18} className="text-[#c5a880]" />
        <h3 className="text-base font-semibold text-[#574f41]">لیست کارهای امروز</h3>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          id="task-input-field"
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="کار جدیدی اضافه کنید..."
          className="flex-1 bg-white border border-[#f5ebe0] rounded-xl px-4 py-2 text-sm text-[#44403c] placeholder-[#bcaf9c] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-all"
        />
        <button
          id="add-task-btn"
          type="submit"
          className="p-2.5 bg-[#8c7851] text-white rounded-xl hover:bg-[#7c6a46] cursor-pointer transition-colors active:scale-95"
          title="افزودن کار"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[#ecdccb] rounded-xl bg-[#faf7f2]">
          <p className="text-xs text-[#a89a7a]">هنوز هیچ کاری برای امروز ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 border group
                ${task.completed 
                  ? "bg-stone-50 border-[#ecdccb] opacity-80" 
                  : "bg-white border-[#f5ebe0] hover:border-[#ebdccb]"
                }
              `}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Toggle Button */}
                <button
                  id={`task-toggle-${task.id}`}
                  onClick={() => handleToggle(task.id)}
                  className="flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95"
                >
                  {task.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle size={18} className="text-[#c5b394] hover:text-[#8c7851]" />
                  )}
                </button>

                {/* Task Text */}
                <span className={`text-sm text-[#44403c] truncate break-words flex-1 pr-1
                  ${task.completed ? "line-through text-stone-400" : ""}
                `}>
                  {task.text}
                </span>
              </div>

              {/* Delete Button */}
              <button
                id={`task-delete-${task.id}`}
                onClick={() => handleDelete(task.id)}
                className="p-1 text-[#c5b394] hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                title="حذف کار"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
