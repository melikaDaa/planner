import React from "react";
import { TimelineItem } from "../types";
import { Clock, CheckSquare, Square } from "lucide-react";
import { toPersianDigits } from "../utils/jalali";

interface TimelineScheduleProps {
  timeline: TimelineItem[];
  onChange: (updated: TimelineItem[]) => void;
}

// Fixed elegant time slots to mimic paper diaries
const DEFAULT_TIME_SLOTS = [
  "۰۷:۰۰", // Morning
  "۰۹:۰۰",
  "۱۱:۰۰",
  "۱۳:۰۰", // Midday
  "۱۵:۰۰",
  "۱۷:۰۰", // Afternoon
  "۱۹:۰۰",
  "۲۱:۰۰", // Evening
  "۲۳:۰۰"  // Night
];

export const TimelineSchedule: React.FC<TimelineScheduleProps> = ({
  timeline,
  onChange
}) => {
  // Sync state with default slots, preserving user edits
  const items = React.useMemo(() => {
    return DEFAULT_TIME_SLOTS.map((time) => {
      const existing = timeline.find((item) => item.time === time);
      return existing || { id: crypto.randomUUID(), time, text: "", completed: false };
    });
  }, [timeline]);

  const handleTextChange = (time: string, text: string) => {
    const existingIndex = timeline.findIndex((item) => item.time === time);
    let updated = [...timeline];

    if (existingIndex > -1) {
      updated[existingIndex] = { ...updated[existingIndex], text };
    } else {
      updated.push({
        id: crypto.randomUUID(),
        time,
        text,
        completed: false
      });
    }

    onChange(updated);
  };

  const handleToggle = (time: string) => {
    const existingIndex = timeline.findIndex((item) => item.time === time);
    let updated = [...timeline];

    if (existingIndex > -1) {
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        completed: !updated[existingIndex].completed 
      };
    } else {
      // Find default details
      updated.push({
        id: crypto.randomUUID(),
        time,
        text: "",
        completed: true
      });
    }

    onChange(updated);
  };

  return (
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="flex items-center gap-2 mb-4 border-b border-[#f5ebe0] pb-2">
        <Clock size={18} className="text-[#c5a880]" />
        <h3 className="text-base font-semibold text-[#574f41]">جدول زمان‌بندی روزانه</h3>
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const hasText = item.text.trim().length > 0;
          return (
            <div 
              key={item.time} 
              className="flex items-center gap-3 py-1.5 border-b border-dashed border-[#faf5ef] group hover:bg-[#faf9f6] rounded-md px-1 transition-colors"
            >
              {/* Hour Indicator */}
              <div className="w-12 text-[#8c7a5c] font-mono text-xs select-none">
                {item.time}
              </div>

              {/* Line Connector check */}
              <button
                id={`timeline-toggle-${item.time.replace(':', '-')}`}
                onClick={() => handleToggle(item.time)}
                disabled={!hasText}
                className="text-[#c5b394] hover:text-[#8c7851] cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                title={item.completed ? "تکمیل شده" : "نشانه تکمیل"}
              >
                {item.completed ? (
                  <CheckSquare size={16} className="text-emerald-600 fill-emerald-50" />
                ) : (
                  <Square size={16} className="text-[#dcd6cd]" />
                )}
              </button>

              {/* Interactive Line text */}
              <input
                id={`timeline-input-${item.time.replace(':', '-')}`}
                type="text"
                value={item.text}
                onChange={(e) => handleTextChange(item.time, e.target.value)}
                placeholder="برنامه این ساعت را بنویسید..."
                className={`flex-1 bg-transparent text-sm text-[#44403c] border-none focus:outline-none placeholder-[#d0c6b8] transition-all
                  ${item.completed ? "line-through text-stone-400 font-light" : ""}
                `}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
