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
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-[#f5ebe0] pb-2">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#c5a880]" />
          <h3 className="text-base font-semibold text-[#574f41]">یادآورهای امروز</h3>
        </div>

        <button
          id="toggle-reminder-form-btn"
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-[#8c7851] hover:text-[#7c6a46] font-medium transition-colors cursor-pointer"
        >
          {showAdd ? "انصراف" : "+ یادآور جدید"}
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="space-y-3 mb-4 p-3 bg-[#faf7f2] border border-[#f2e7da] rounded-xl">
          <input
            id="reminder-input-field"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="عنوان یادآور..."
            className="w-full bg-white border border-[#f5ebe0] rounded-xl px-3 py-1.5 text-xs text-[#44403c] placeholder-[#bcaf9c] focus:outline-none focus:border-[#c5a880] transition-all"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8c7a5c]">ساعت یادآوری:</span>
            <div className="flex items-center gap-1">
              {/* Hour select */}
              <select
                id="reminder-hour-select"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="bg-white border border-[#f5ebe0] rounded-lg p-1 text-xs text-[#44403c] focus:outline-none"
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const val = String(h).padStart(2, "0");
                  return (
                    <option key={val} value={val}>
                      {toPersianDigits(val)}
                    </option>
                  );
                })}
              </select>

              <span className="text-xs text-[#a89a7a]">:</span>

              {/* Minute select */}
              <select
                id="reminder-minute-select"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="bg-white border border-[#f5ebe0] rounded-lg p-1 text-xs text-[#44403c] focus:outline-none"
              >
                {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                  <option key={m} value={m}>
                    {toPersianDigits(m)}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="submit-reminder-btn"
              type="submit"
              className="mr-auto px-4 py-1.5 bg-[#8c7851] text-white rounded-xl text-xs hover:bg-[#7c6a46] cursor-pointer transition-colors"
            >
              ثبت یادآور
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-[#ecdccb] rounded-xl bg-[#faf7f2]">
          <p className="text-xs text-[#a89a7a]">هنوز یادآوری برای امروز ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group
                ${item.completed
                  ? "bg-stone-50 border-[#ecdccb] opacity-85"
                  : "bg-white border-[#f5ebe0] hover:border-[#ebdccb]"
                }
              `}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Complete/Uncomplete checkbox */}
                <button
                  id={`reminder-toggle-${item.id}`}
                  onClick={() => handleToggle(item.id)}
                  className="flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95"
                >
                  {item.completed ? (
                    <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle size={16} className="text-[#c5b394] hover:text-[#8c7851]" />
                  )}
                </button>

                {/* Time Indicator */}
                <span className="text-[11px] font-mono font-bold bg-[#faf7f2] text-[#8c7a5c] px-2 py-0.5 rounded border border-[#f2e7da] flex-shrink-0">
                  {item.time}
                </span>

                {/* Title */}
                <span
                  className={`text-xs text-[#44403c] truncate pr-1 flex-1
                    ${item.completed ? "line-through text-stone-400" : ""}
                  `}
                >
                  {item.text}
                </span>
              </div>

              {/* Delete Button */}
              <button
                id={`reminder-delete-${item.id}`}
                onClick={() => handleDelete(item.id)}
                className="p-1 text-[#c5b394] hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
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
