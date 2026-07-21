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
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mood Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#574f41] font-semibold text-sm">
            <Smile size={16} className="text-[#c5a880]" />
            <span>حس و حال امروز</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {MOODS.map((item) => {
              const isSelected = mood === item.key;
              return (
                <button
                  key={item.key}
                  id={`mood-btn-${item.key}`}
                  onClick={() => onMoodChange(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all active:scale-95
                    ${isSelected 
                      ? `${item.color} font-medium scale-105 ring-1 ring-[#c5a880]` 
                      : "bg-white border-[#f5ebe0] text-[#6b6661] hover:bg-[#faf6f0]"
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#574f41] font-semibold text-sm">
            <Sparkles size={16} className="text-[#c5a880]" />
            <span>سطح انرژی روزانه</span>
          </div>

          <div className="flex items-center gap-2.5">
            {[1, 2, 3, 4, 5].map((level) => {
              const isSelected = energy === level;
              const isUnderOrEqual = energy >= level;
              
              return (
                <button
                  key={level}
                  id={`energy-btn-${level}`}
                  onClick={() => onEnergyChange(level)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all active:scale-95 cursor-pointer
                    ${isSelected
                      ? "bg-[#8c7851] border-[#8c7851] text-white scale-105"
                      : isUnderOrEqual
                        ? "bg-[#f5ebe0] border-[#eaddcf] text-[#574f41]"
                        : "bg-white border-[#f5ebe0] text-[#bcaf9c] hover:bg-[#faf6f0]"
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
