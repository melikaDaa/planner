import React from "react";
import { ReminderItem } from "../types";
import { Bell, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toPersianDigits } from "../utils/jalali";

interface ReminderSystemProps {
  reminders: ReminderItem[];
  onChange: (updated: ReminderItem[]) => void;
}

export const ReminderSystem: React.FC<ReminderSystemProps> = ({
  reminders = [],
  onChange
}) => {
  const [text, setText] = React.useState("");
  const [hour, setHour] = React.useState("12");
  const [minute, setMinute] = React.useState("00");
  const [showAdd, setShowAdd] = React.useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    const persianTime = toPersianDigits(formattedTime);

    const newItem: ReminderItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      time: persianTime,
      completed: false
    };

    onChange([...reminders, newItem]);
    setText("");
    setShowAdd(false);
  };

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    onChange(updated);
  };

  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-3.5 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
            <Bell size={16} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#1a231e] dark:text-[#f0f7f2]">یادآورهای امروز</h3>
        </div>

        <button
          id="toggle-reminder-form-btn"
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-[#2e4f40] dark:text-emerald-300 bg-[#eaf0ec] dark:bg-[#141d18] hover:bg-[#dce9df] dark:hover:bg-[#27382e] border border-[#cfdcd3] dark:border-[#2d3e33] font-bold transition-all cursor-pointer px-3 py-1.5 rounded-xl active:scale-95 shadow-2xs"
        >
          {showAdd ? "انصراف" : "+ یادآور جدید"}
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="space-y-3 mb-4 p-3 bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl shadow-2xs">
          <input
            id="reminder-input-field"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="عنوان یادآور..."
            className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#2e4f40]/20 transition-all font-medium"
            autoFocus
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#526357] dark:text-[#b4d0bd]">ساعت:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-lg p-1">
                {/* Hour select */}
                <select
                  id="reminder-hour-select"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="bg-transparent text-xs text-[#1a231e] dark:text-[#f0f7f2] font-bold focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 24 }).map((_, h) => {
                    const val = String(h).padStart(2, "0");
                    return (
                      <option key={val} value={val} className="bg-white dark:bg-[#1f2c25] text-[#1a231e] dark:text-[#f0f7f2]">
                        {toPersianDigits(val)}
                      </option>
                    );
                  })}
                </select>

                <span className="text-xs text-[#829487] dark:text-[#88a896] font-bold">:</span>

                {/* Minute select */}
                <select
                  id="reminder-minute-select"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="bg-transparent text-xs text-[#1a231e] dark:text-[#f0f7f2] font-bold focus:outline-none cursor-pointer"
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                    <option key={m} value={m} className="bg-white dark:bg-[#1f2c25] text-[#1a231e] dark:text-[#f0f7f2]">
                      {toPersianDigits(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="submit-reminder-btn"
              type="submit"
              className="px-4 py-1.5 bg-[#2e4f40] dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-[#233f33] dark:hover:bg-emerald-700 cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              ثبت یادآور
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl bg-[#f8faf8] dark:bg-[#141d18]">
          <p className="text-xs text-[#829487] dark:text-[#88a896]">هنوز یادآوری برای امروز ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group min-h-[44px]
                ${item.completed
                  ? "bg-stone-50/80 dark:bg-[#141d18]/60 border-emerald-200/80 dark:border-emerald-800/60 opacity-80"
                  : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] hover:border-[#2e4f40]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-[#19241d] shadow-2xs"
                }
              `}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Complete/Uncomplete checkbox */}
                <button
                  id={`reminder-toggle-${item.id}`}
                  onClick={() => handleToggle(item.id)}
                  className="flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  {item.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                  ) : (
                    <Circle size={18} className="text-[#829487] dark:text-[#6b8273] hover:text-[#2e4f40] dark:hover:text-emerald-400 transition-colors" />
                  )}
                </button>

                {/* Time Indicator */}
                <span className="text-[11px] font-mono font-bold bg-[#eaf0ec] dark:bg-[#25362c] text-[#2e4f40] dark:text-emerald-300 border border-[#cfdcd3] dark:border-[#2d3e33] px-2 py-0.5 rounded-md flex-shrink-0">
                  {item.time}
                </span>

                {/* Title */}
                <span
                  className={`text-xs text-[#1a231e] dark:text-[#f0f7f2] font-medium truncate pr-1 flex-1
                    ${item.completed ? "line-through text-slate-400 dark:text-slate-500 font-normal" : ""}
                  `}
                >
                  {item.text}
                </span>
              </div>

              {/* Delete Button */}
              <button
                id={`reminder-delete-${item.id}`}
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-rose-600 dark:hover:text-rose-400 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                title="حذف یادآوری"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
