import React from "react";
import { TaskItem, TimelineItem } from "../types";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ListTodo, 
  Pencil, 
  Calendar,
  X
} from "lucide-react";
import { toPersianDigits } from "../utils/jalali";

interface UnifiedTaskListProps {
  tasks: TaskItem[];
  timeline: TimelineItem[]; // Kept for backwards compatibility / sync
  onChange: (updatedTasks: TaskItem[], updatedTimeline: TimelineItem[]) => void;
}

const PRESET_TIMES = [
  "۰۷:۰۰",
  "۰۸:۰۰",
  "۰۹:۰۰",
  "۱۰:۰۰",
  "۱۱:۰۰",
  "۱۲:۰۰",
  "۱۳:۰۰",
  "۱۴:۰۰",
  "۱۵:۰۰",
  "۱۶:۰۰",
  "۱۷:۰۰",
  "۱۸:۰۰",
  "۱۹:۰۰",
  "۲۰:۰۰",
  "۲۱:۰۰",
  "۲۲:۰۰",
  "۲۳:۰۰"
];

export const UnifiedTaskList: React.FC<UnifiedTaskListProps> = ({
  tasks,
  timeline,
  onChange
}) => {
  const [newText, setNewText] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"all" | "timeline" | "tasks">("all");

  // Sync timeline items into tasks format if needed
  const combinedTasks = React.useMemo(() => {
    const list: TaskItem[] = [...tasks];
    
    // Add timeline entries if not already represented in tasks
    timeline.forEach(tl => {
      if (tl.text.trim()) {
        const existing = list.find(t => t.id === tl.id || (t.time === tl.time && t.text === tl.text));
        if (!existing) {
          list.push({
            id: tl.id,
            text: tl.text,
            completed: tl.completed,
            time: tl.time
          });
        }
      }
    });

    return list;
  }, [tasks, timeline]);

  // Separate timed tasks and unscheduled tasks
  const timedTasks = React.useMemo(() => {
    return combinedTasks
      .filter(t => !!t.time && t.time.trim().length > 0)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [combinedTasks]);

  const unscheduledTasks = React.useMemo(() => {
    return combinedTasks.filter(t => !t.time || t.time.trim().length === 0);
  }, [combinedTasks]);

  // Propagate changes up to parent state
  const notifyParent = (updatedList: TaskItem[]) => {
    // Generate corresponding timeline items
    const updatedTimeline: TimelineItem[] = updatedList
      .filter(t => !!t.time)
      .map(t => ({
        id: t.id,
        time: t.time!,
        text: t.text,
        completed: t.completed
      }));

    onChange(updatedList, updatedTimeline);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      completed: false,
      time: selectedTime || undefined
    };

    const updated = [...combinedTasks, newTask];
    notifyParent(updated);
    setNewText("");
    setSelectedTime(null);
  };

  const handleToggle = (id: string) => {
    const updated = combinedTasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    notifyParent(updated);
  };

  const handleDelete = (id: string) => {
    const updated = combinedTasks.filter(t => t.id !== id);
    notifyParent(updated);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) {
      handleDelete(id);
    } else {
      const updated = combinedTasks.map(t =>
        t.id === id ? { ...t, text: editingText.trim() } : t
      );
      notifyParent(updated);
    }
    setEditingTaskId(null);
  };

  const handleAssignTime = (id: string, timeStr: string | undefined) => {
    const updated = combinedTasks.map(t =>
      t.id === id ? { ...t, time: timeStr } : t
    );
    notifyParent(updated);
  };

  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      
      {/* Header & View Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-4 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
            <ListTodo size={16} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#1a231e] dark:text-[#f0f7f2]">کارهای امروز و زمان‌بندی</h3>
        </div>

        {/* View mode toggle pills */}
        <div className="flex items-center gap-1 bg-[#f4f7f5] dark:bg-[#141d18] p-1 rounded-xl border border-[#d2e0d5] dark:border-[#2d3e33] text-xs select-none">
          <button
            id="task-view-all"
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[34px] flex items-center cursor-pointer
              ${viewMode === "all" ? "bg-[#2e4f40] dark:bg-emerald-600 text-white shadow-xs font-bold" : "text-[#526357] dark:text-[#b4d0bd] hover:text-[#1a231e] dark:hover:text-[#f0f7f2] hover:bg-white/60 dark:hover:bg-[#1f2c25]"}
            `}
          >
            همه ({toPersianDigits(combinedTasks.length)})
          </button>
          <button
            id="task-view-timeline"
            onClick={() => setViewMode("timeline")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[34px] flex items-center cursor-pointer gap-1.5
              ${viewMode === "timeline" ? "bg-[#2e4f40] dark:bg-emerald-600 text-white shadow-xs font-bold" : "text-[#526357] dark:text-[#b4d0bd] hover:text-[#1a231e] dark:hover:text-[#f0f7f2] hover:bg-white/60 dark:hover:bg-[#1f2c25]"}
            `}
          >
            <Clock size={12} />
            <span>زمان‌دار ({toPersianDigits(timedTasks.length)})</span>
          </button>
          <button
            id="task-view-tasks"
            onClick={() => setViewMode("tasks")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[34px] flex items-center cursor-pointer gap-1.5
              ${viewMode === "tasks" ? "bg-[#2e4f40] dark:bg-emerald-600 text-white shadow-xs font-bold" : "text-[#526357] dark:text-[#b4d0bd] hover:text-[#1a231e] dark:hover:text-[#f0f7f2] hover:bg-white/60 dark:hover:bg-[#1f2c25]"}
            `}
          >
            <span>بدون زمان ({toPersianDigits(unscheduledTasks.length)})</span>
          </button>
        </div>
      </div>

      {/* Add Task Input Form with Optional Time Picker */}
      <form onSubmit={handleAddTask} className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              id="unified-task-input"
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="عنوان کار یا برنامه جدید را بنویسید..."
              className="w-full bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl pr-4 pl-10 py-2.5 text-xs sm:text-sm text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#2e4f40]/20 transition-all min-h-[44px] font-medium"
            />
            {newText && (
              <button
                type="button"
                onClick={() => setNewText("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829487] dark:text-[#88a896] hover:text-[#1a231e] dark:hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            id="add-unified-task-btn"
            type="submit"
            className="px-4 py-2.5 bg-[#2e4f40] dark:bg-emerald-600 hover:bg-[#233f33] dark:hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs min-h-[44px] shadow-xs"
          >
            <Plus size={16} />
            <span>افزودن</span>
          </button>
        </div>

        {/* Optional Time Presets Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-[#526357] dark:text-[#b4d0bd] flex items-center gap-1 select-none pl-1">
            <Clock size={12} className="text-[#2e4f40] dark:text-emerald-400" />
            <span>ساعت:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedTime(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all min-h-[30px] cursor-pointer border
              ${selectedTime === null
                ? "bg-[#2e4f40] dark:bg-emerald-600 text-white border-[#2e4f40] dark:border-emerald-600 font-bold"
                : "bg-white dark:bg-[#141d18] text-[#1a231e] dark:text-[#f0f7f2] border-[#d2e0d5] dark:border-[#2d3e33] hover:border-[#2e4f40]/50"
              }
            `}
          >
            بدون زمان
          </button>

          {PRESET_TIMES.slice(1, 11).map(time => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(selectedTime === time ? null : time)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all min-h-[30px] cursor-pointer border
                ${selectedTime === time
                  ? "bg-[#2e4f40] dark:bg-emerald-600 text-white border-[#2e4f40] dark:border-emerald-600 font-bold"
                  : "bg-white dark:bg-[#141d18] text-[#1a231e] dark:text-[#f0f7f2] border-[#d2e0d5] dark:border-[#2d3e33] hover:border-[#2e4f40]/50"
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </form>

      {/* Task Displays */}
      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
        
        {/* SECTION 1: TIMELINE / TIMED TASKS */}
        {(viewMode === "all" || viewMode === "timeline") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#526357] dark:text-[#b4d0bd] border-b border-[#e2ece4] dark:border-[#2d3e33] pb-1.5 select-none">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#2e4f40] dark:text-emerald-400" />
                <span>برنامه‌های زمان‌بندی شده</span>
              </span>
              <span className="text-[10px] bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-300 border border-[#cfdcd3] dark:border-[#2d3e33] px-2 py-0.5 rounded-full font-bold">
                {toPersianDigits(timedTasks.length)} مورد
              </span>
            </div>

            {timedTasks.length === 0 ? (
              <div className="py-3 px-3 text-center border border-dashed border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl bg-[#f8faf8] dark:bg-[#141d18]">
                <p className="text-[11px] text-[#829487] dark:text-[#88a896]">هنوز هیچ برنامه زمان‌داری ثبت نشده است.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {timedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 group min-h-[44px]
                      ${task.completed 
                        ? "bg-stone-50/80 dark:bg-[#141d18]/60 border-emerald-200/80 dark:border-emerald-800/60 opacity-80" 
                        : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] hover:border-[#2e4f40]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-[#19241d] shadow-2xs"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        id={`task-toggle-${task.id}`}
                        onClick={() => handleToggle(task.id)}
                        className="flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                        ) : (
                          <Circle size={18} className="text-[#829487] dark:text-[#6b8273] hover:text-[#2e4f40] dark:hover:text-emerald-400 transition-colors" />
                        )}
                      </button>

                      {/* Time Badge */}
                      <span className="px-2 py-0.5 bg-[#eaf0ec] dark:bg-[#25362c] text-[#2e4f40] dark:text-emerald-300 border border-[#cfdcd3] dark:border-[#2d3e33] rounded-md font-mono text-[11px] font-bold select-none flex-shrink-0">
                        {task.time}
                      </span>

                      {/* Text or Inline Edit */}
                      {editingTaskId === task.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleSaveEdit(task.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(task.id)}
                          autoFocus
                          className="flex-1 bg-white dark:bg-[#1f2c25] border border-[#2e4f40] dark:border-emerald-500 rounded-lg px-2 py-1 text-xs text-[#1a231e] dark:text-[#f0f7f2] focus:outline-none font-medium"
                        />
                      ) : (
                        <span 
                          onClick={() => { setEditingTaskId(task.id); setEditingText(task.text); }}
                          className={`text-xs text-[#1a231e] dark:text-[#f0f7f2] font-medium truncate flex-1 cursor-pointer hover:text-[#2e4f40] dark:hover:text-emerald-400 transition-colors
                            ${task.completed ? "line-through text-slate-400 dark:text-slate-500 font-normal" : ""}
                          `}
                        >
                          {task.text}
                        </span>
                      )}
                    </div>

                    {/* Actions: Edit & Remove Time & Delete */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingTaskId(task.id); setEditingText(task.text); }}
                        className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-[#2e4f40] dark:hover:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                        title="ویرایش متن"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        onClick={() => handleAssignTime(task.id, undefined)}
                        className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-[#2e4f40] dark:hover:text-emerald-400 rounded-lg cursor-pointer text-[10px] transition-colors"
                        title="حذف ساعت"
                      >
                        <X size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-rose-600 dark:hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: UNSCHEDULED TASKS */}
        {(viewMode === "all" || viewMode === "tasks") && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#526357] dark:text-[#b4d0bd] border-b border-[#e2ece4] dark:border-[#2d3e33] pb-1.5 select-none">
              <span>کارهای عمومی (بدون زمان)</span>
              <span className="text-[10px] bg-slate-100 dark:bg-[#141d18] text-slate-700 dark:text-[#b4d0bd] border border-slate-200 dark:border-[#2d3e33] px-2 py-0.5 rounded-full font-bold">
                {toPersianDigits(unscheduledTasks.length)} مورد
              </span>
            </div>

            {unscheduledTasks.length === 0 ? (
              <div className="py-3 px-3 text-center border border-dashed border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl bg-[#f8faf8] dark:bg-[#141d18]">
                <p className="text-[11px] text-[#829487] dark:text-[#88a896]">کار عمومی ثبت‌نشده‌ای وجود ندارد.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {unscheduledTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 group min-h-[44px]
                      ${task.completed 
                        ? "bg-stone-50/80 dark:bg-[#141d18]/60 border-emerald-200/80 dark:border-emerald-800/60 opacity-80" 
                        : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] hover:border-[#2e4f40]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-[#19241d] shadow-2xs"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        id={`task-toggle-${task.id}`}
                        onClick={() => handleToggle(task.id)}
                        className="flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                        ) : (
                          <Circle size={18} className="text-[#829487] dark:text-[#6b8273] hover:text-[#2e4f40] dark:hover:text-emerald-400 transition-colors" />
                        )}
                      </button>

                      {/* Text or Inline Edit */}
                      {editingTaskId === task.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleSaveEdit(task.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(task.id)}
                          autoFocus
                          className="flex-1 bg-white dark:bg-[#1f2c25] border border-[#2e4f40] dark:border-emerald-500 rounded-lg px-2 py-1 text-xs text-[#1a231e] dark:text-[#f0f7f2] focus:outline-none font-medium"
                        />
                      ) : (
                        <span 
                          onClick={() => { setEditingTaskId(task.id); setEditingText(task.text); }}
                          className={`text-xs text-[#1a231e] dark:text-[#f0f7f2] font-medium truncate flex-1 cursor-pointer hover:text-[#2e4f40] dark:hover:text-emerald-400 transition-colors
                            ${task.completed ? "line-through text-slate-400 dark:text-slate-500 font-normal" : ""}
                          `}
                        >
                          {task.text}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Assign Quick Time */}
                      <button
                        onClick={() => handleAssignTime(task.id, "۱۰:۰۰")}
                        className="px-2 py-1 text-[10px] font-bold text-[#2e4f40] dark:text-emerald-300 bg-[#eaf0ec] dark:bg-[#25362c] border border-[#cfdcd3] dark:border-[#2d3e33] hover:bg-[#2e4f40] dark:hover:bg-emerald-600 hover:text-white hover:border-[#2e4f40] rounded-lg transition-all cursor-pointer flex items-center gap-1 select-none"
                        title="افزودن ساعت به برنامه"
                      >
                        <Clock size={11} />
                        <span>زمان‌بندی</span>
                      </button>

                      <button
                        onClick={() => { setEditingTaskId(task.id); setEditingText(task.text); }}
                        className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-[#2e4f40] dark:hover:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                        title="ویرایش متن"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-rose-600 dark:hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
