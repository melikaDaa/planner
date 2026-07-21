import React from "react";
import { PriorityItem } from "../types";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
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
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-[#c5a880]" />
        <h3 className="text-base font-semibold text-[#574f41]">۳ اولویت اصلی امروز</h3>
      </div>
      
      <div className="space-y-3.5">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 border
              ${item.completed 
                ? "bg-stone-50 border-[#ecdccb] opacity-85" 
                : "bg-white border-[#f5ebe0] hover:border-[#ebdccb]"
              }
            `}
          >
            {/* Index label */}
            <span className="text-[#a89a7a] font-bold text-sm w-4 select-none">
              {toPersianDigits(numberWords[index])}
            </span>

            {/* Checkbox button */}
            <button
              id={`priority-toggle-${index}`}
              onClick={() => handleToggle(index)}
              disabled={!item.text.trim()}
              className={`flex-shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {item.completed ? (
                <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-50" />
              ) : (
                <Circle size={20} className="text-[#c5b394] hover:text-[#8c7851]" />
              )}
            </button>

            {/* Text input */}
            <input
              id={`priority-input-${index}`}
              type="text"
              value={item.text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              placeholder={placeholders[index]}
              className={`w-full bg-transparent text-sm text-[#44403c] border-none focus:outline-none placeholder-[#bcaf9c] transition-all
                ${item.completed ? "line-through text-stone-400" : ""}
              `}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
