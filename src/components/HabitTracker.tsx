import React from "react";
import { HabitItem, HabitDefinition } from "../types";
import { Check, Plus, Trash2, Heart } from "lucide-react";

interface HabitTrackerProps {
  // Current day's habits with their completion state
  dayHabits: HabitItem[];
  // List of all active habit definitions (global definitions)
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
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-[#f5ebe0] pb-2">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-[#c5a880] fill-[#fcfbf9]" />
          <h3 className="text-base font-semibold text-[#574f41]">ردیاب عادت‌ها</h3>
        </div>
        
        <button
          id="toggle-habit-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-[#8c7851] hover:text-[#7c6a46] font-medium transition-colors cursor-pointer"
        >
          {showAddForm ? "انصراف" : "+ عادت جدید"}
        </button>
      </div>

      {/* Add Custom Habit Inline Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4 animate-fadeIn">
          <input
            id="new-habit-input"
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="مثلا: پیاده‌روی، یادگیری زبان..."
            className="flex-1 bg-white border border-[#f5ebe0] rounded-xl px-3 py-1.5 text-xs text-[#44403c] placeholder-[#bcaf9c] focus:outline-none focus:border-[#c5a880] transition-all"
            autoFocus
          />
          <button
            id="submit-habit-btn"
            type="submit"
            className="px-3 py-1.5 bg-[#8c7851] text-white rounded-xl text-xs hover:bg-[#7c6a46] cursor-pointer transition-colors active:scale-95"
          >
            ثبت
          </button>
        </form>
      )}

      {habitDefinitions.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-[#ecdccb] rounded-xl bg-[#faf7f2]">
          <p className="text-xs text-[#a89a7a]">هنوز عادتی تعریف نکرده‌اید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {habitDefinitions.map((habitDef) => {
            // Check if this habit is marked completed for the current day
            const isCompleted = dayHabits.some(h => h.id === habitDef.id && h.completed);

            return (
              <div 
                key={habitDef.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group
                  ${isCompleted 
                    ? "bg-[#f1ebe1] border-[#ecdccb] text-[#574f41]" 
                    : "bg-white border-[#f5ebe0] text-[#6b6661] hover:border-[#ebdccb]"
                  }
                `}
              >
                <button
                  id={`habit-toggle-${habitDef.id}`}
                  onClick={() => onToggleHabit(habitDef.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-right focus:outline-none"
                >
                  {/* Habit Check Circle */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all
                    ${isCompleted 
                      ? "bg-[#8c7851] border-[#8c7851] text-white" 
                      : "border-[#c5b394] bg-white text-transparent group-hover:border-[#8c7851]"
                    }
                  `}>
                    <Check size={12} className="stroke-[3]" />
                  </div>

                  {/* Habit Title */}
                  <span className={`text-xs truncate ${isCompleted ? "font-medium" : ""}`}>
                    {habitDef.name}
                  </span>
                </button>

                {/* Delete Definition Button (only visible on hover to keep interface minimal) */}
                <button
                  id={`habit-delete-${habitDef.id}`}
                  onClick={() => onDeleteGlobalHabit(habitDef.id)}
                  className="p-1 text-[#dcd6cd] hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                  title="حذف این عادت"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
