import React from "react";
import { MOODS } from "../types";
import { Sparkles, Smile } from "lucide-react";
import { toPersianDigits } from "../utils/jalali";

interface MoodAndEnergyProps {
  mood: string;
  energy: number;
  onMoodChange: (mood: string) => void;
  onEnergyChange: (energy: number) => void;
}

export const MoodAndEnergy: React.FC<MoodAndEnergyProps> = ({
  mood,
  energy,
  onMoodChange,
  onEnergyChange
}) => {
  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Mood Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[#1a231e] dark:text-[#f0f7f2] font-bold text-xs sm:text-sm">
            <div className="p-1 rounded-md bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
              <Smile size={15} />
            </div>
            <span>حس و حال امروز</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((item) => {
              const isSelected = mood === item.key;
              return (
                <button
                  key={item.key}
                  id={`mood-btn-${item.key}`}
                  onClick={() => onMoodChange(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all active:scale-95 font-medium
                    ${isSelected 
                      ? `${item.color} font-bold shadow-xs ring-2 ring-[#2e4f40]/30 scale-105 border-transparent` 
                      : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] text-[#1a231e] dark:text-[#f0f7f2] hover:bg-white dark:hover:bg-[#27382e] hover:border-[#2e4f40]/40"
                    }
                  `}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[#1a231e] dark:text-[#f0f7f2] font-bold text-xs sm:text-sm">
            <div className="p-1 rounded-md bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
              <Sparkles size={15} />
            </div>
            <span>سطح انرژی روزانه</span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
              const isSelected = energy === level;
              const isUnderOrEqual = energy >= level;
              
              return (
                <button
                  key={level}
                  id={`energy-btn-${level}`}
                  onClick={() => onEnergyChange(level)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all active:scale-95 cursor-pointer shadow-2xs
                    ${isSelected
                      ? "bg-[#2e4f40] dark:bg-emerald-600 border-[#2e4f40] dark:border-emerald-600 text-white scale-105 ring-2 ring-[#2e4f40]/20"
                      : isUnderOrEqual
                        ? "bg-[#eaf0ec] dark:bg-[#25362c] border-[#cfdcd3] dark:border-[#2d3e33] text-[#2e4f40] dark:text-emerald-300 font-extrabold"
                        : "bg-[#f8faf8] dark:bg-[#141d18] border-[#d2e0d5] dark:border-[#2d3e33] text-[#829487] dark:text-[#88a896] hover:bg-white dark:hover:bg-[#27382e] hover:border-[#2e4f40]/40"
                    }
                  `}
                >
                  {toPersianDigits(level)}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
