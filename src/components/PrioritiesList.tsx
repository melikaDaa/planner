import React from "react";
import { PriorityItem } from "../types";
import { CheckCircle2, Circle, Trophy, Pencil } from "lucide-react";
import { toPersianDigits } from "../utils/jalali";

interface PrioritiesListProps {
  priorities: PriorityItem[];
  onChange: (updated: PriorityItem[]) => void;
}

export const PrioritiesList: React.FC<PrioritiesListProps> = ({
  priorities,
  onChange
}) => {
  // Ensure we always have exactly 3 priority items
  const items = React.useMemo(() => {
    const arr = [...priorities];
    while (arr.length < 3) {
      arr.push({ text: "", completed: false });
    }
    return arr.slice(0, 3);
  }, [priorities]);

  const handleTextChange = (index: number, text: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], text };
    onChange(updated);
  };

  const handleToggle = (index: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    onChange(updated);
  };

  const placeholders = [
    "اولویت اول امروز...",
    "اولویت دوم امروز...",
    "اولویت سوم امروز..."
  ];

  const numberWords = ["۱", "۲", "۳"];

  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-3 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
            <Trophy size={16} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#1a231e] dark:text-[#f0f7f2]">۳ اولویت اصلی امروز</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#526357] dark:text-[#b4d0bd] font-medium select-none">
          <Pencil size={12} className="text-[#2e4f40] dark:text-emerald-400" />
          <span>ویرایش مستقیم</span>
        </div>
      </div>
      
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 border min-h-[48px] group
              ${item.completed 
                ? "bg-stone-50/80 dark:bg-[#141d18]/60 border-emerald-200/80 dark:border-emerald-800/60 opacity-85" 
                : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] hover:border-[#2e4f40]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-[#19241d] shadow-2xs"
              }
            `}
          >
            {/* Index badge */}
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs select-none transition-colors
              ${item.completed 
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300" 
                : "bg-[#eaf0ec] dark:bg-[#1f2c25] text-[#2e4f40] dark:text-emerald-300 border border-[#cfdcd3] dark:border-[#2d3e33]"
              }
            `}>
              {toPersianDigits(numberWords[index])}
            </span>

            {/* Checkbox button */}
            <button
              id={`priority-toggle-${index}`}
              onClick={() => handleToggle(index)}
              disabled={!item.text.trim()}
              className={`flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed min-w-[32px] min-h-[32px] flex items-center justify-center`}
            >
              {item.completed ? (
                <CheckCircle2 size={20} className="text-emerald-700 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
              ) : (
                <Circle size={20} className="text-[#829487] dark:text-[#6b8273] hover:text-[#2e4f40] dark:hover:text-emerald-400 transition-colors" />
              )}
            </button>

            {/* Text input */}
            <input
              id={`priority-input-${index}`}
              type="text"
              value={item.text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              placeholder={placeholders[index]}
              className={`w-full bg-transparent text-xs sm:text-sm text-[#1a231e] dark:text-[#f0f7f2] border-none focus:outline-none placeholder-[#829487] dark:placeholder-[#88a896] font-medium transition-all
                ${item.completed ? "line-through text-slate-400 dark:text-slate-500 font-normal" : ""}
              `}
            />

            {/* Edit Indicator Icon on Hover */}
            <Pencil size={13} className="text-[#829487] dark:text-[#6b8273] group-hover:text-[#2e4f40] dark:group-hover:text-emerald-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
};
