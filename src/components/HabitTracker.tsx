import React from "react";
import { HabitItem, HabitDefinition } from "../types";
import { Check, Plus, Trash2, Heart, Pencil } from "lucide-react";

interface HabitTrackerProps {
  dayHabits: HabitItem[];
  habitDefinitions: HabitDefinition[];
  onToggleHabit: (habitId: string) => void;
  onAddGlobalHabit: (name: string) => void;
  onDeleteGlobalHabit: (habitId: string) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  dayHabits,
  habitDefinitions,
  onToggleHabit,
  onAddGlobalHabit,
  onDeleteGlobalHabit
}) => {
  const [newHabitName, setNewHabitName] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddGlobalHabit(newHabitName.trim());
    setNewHabitName("");
    setShowAddForm(false);
  };

  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-3.5 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
            <Heart size={16} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#1a231e] dark:text-[#f0f7f2]">ردیاب عادت‌های روزانه</h3>
        </div>
        
        <button
          id="toggle-habit-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-[#2e4f40] dark:text-emerald-300 bg-[#eaf0ec] dark:bg-[#141d18] hover:bg-[#dce9df] dark:hover:bg-[#27382e] border border-[#cfdcd3] dark:border-[#2d3e33] font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[34px] px-3 rounded-xl active:scale-95 shadow-2xs"
        >
          <Plus size={14} />
          <span>{showAddForm ? "انصراف" : "عادت جدید"}</span>
        </button>
      </div>

      {/* Add Custom Habit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3.5">
          <input
            id="new-habit-input"
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="مثلا: مطالعه ۲۰ صفحه، ۳۰ دقیقه پیاده‌روی..."
            className="flex-1 bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl px-3 py-2 text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#2e4f40]/20 transition-all min-h-[42px] font-medium"
            autoFocus
          />
          <button
            id="submit-habit-btn"
            type="submit"
            className="px-4 py-2 bg-[#2e4f40] dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-[#233f33] dark:hover:bg-emerald-700 cursor-pointer transition-all active:scale-95 min-h-[42px] shadow-xs"
          >
            ثبت
          </button>
        </form>
      )}

      {habitDefinitions.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl bg-[#f8faf8] dark:bg-[#141d18]">
          <p className="text-xs text-[#829487] dark:text-[#88a896]">هنوز هیچ عادتی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {habitDefinitions.map((habitDef) => {
            const isCompleted = dayHabits.some(h => h.id === habitDef.id && h.completed);

            return (
              <div 
                key={habitDef.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group min-h-[48px]
                  ${isCompleted 
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-[#1a231e] dark:text-[#f0f7f2]" 
                    : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] text-[#1a231e] dark:text-[#f0f7f2] hover:border-[#2e4f40]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-[#19241d] shadow-2xs"
                  }
                `}
              >
                <button
                  id={`habit-toggle-${habitDef.id}`}
                  onClick={() => onToggleHabit(habitDef.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer text-right focus:outline-none min-h-[40px]"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all
                    ${isCompleted 
                      ? "bg-emerald-700 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-500 text-white shadow-2xs" 
                      : "border-[#829487] dark:border-[#6b8273] bg-white dark:bg-[#1f2c25] text-transparent group-hover:border-[#2e4f40] dark:group-hover:border-emerald-400"
                    }
                  `}>
                    <Check size={14} className="stroke-[3]" />
                  </div>

                  <span className={`text-xs truncate font-bold ${isCompleted ? "line-through text-slate-400 dark:text-slate-500 font-normal" : "text-[#1a231e] dark:text-[#f0f7f2]"}`}>
                    {habitDef.name}
                  </span>
                </button>

                <button
                  id={`habit-delete-${habitDef.id}`}
                  onClick={() => onDeleteGlobalHabit(habitDef.id)}
                  className="p-1.5 text-[#829487] dark:text-[#88a896] hover:text-rose-600 dark:hover:text-rose-400 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
                  title="حذف عادت"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
