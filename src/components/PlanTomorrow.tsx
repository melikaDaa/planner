import React from "react";
import { ArrowLeftRight, Sparkles, NotebookPen } from "lucide-react";

interface PlanTomorrowProps {
  planText: string;
  onChange: (text: string) => void;
  onPromoteToTomorrow: () => void;
}

export const PlanTomorrow: React.FC<PlanTomorrowProps> = ({
  planText,
  onChange,
  onPromoteToTomorrow
}) => {
  const hasText = planText.trim().length > 0;

  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-3.5 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
            <NotebookPen size={16} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#1a231e] dark:text-[#f0f7f2]">برنامه‌ریزی برای فردا</h3>
        </div>
        
        {hasText && (
          <button
            id="promote-tomorrow-btn"
            type="button"
            onClick={onPromoteToTomorrow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2e4f40] dark:bg-emerald-600 text-white hover:bg-[#233f33] dark:hover:bg-emerald-700 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
            title="انتقال برنامه‌های نوشته شده به لیست کارهای فردا"
          >
            <ArrowLeftRight size={13} />
            <span>انتقال به فردا</span>
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          id="tomorrow-plan-textarea"
          value={planText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="افکار، کارها یا اهداف مهم فردا را اینجا یادداشت کنید. سپس با فشردن دکمه «انتقال به فردا»، آن‌ها را مستقیماً به لیست کارهای صفحهٔ فردا بفرستید..."
          rows={4}
          className="w-full bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl p-3.5 text-xs sm:text-sm text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] dark:focus:border-emerald-500 focus:ring-2 focus:ring-[#2e4f40]/20 transition-all resize-none leading-relaxed font-medium"
        />
        
        {!hasText && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] text-[#2e4f40] dark:text-emerald-300 font-medium pointer-events-none select-none bg-[#eaf0ec]/90 dark:bg-[#1f2c25]/90 px-2 py-0.5 rounded-md border border-[#cfdcd3] dark:border-[#2d3e33]">
            <Sparkles size={12} className="text-[#2e4f40] dark:text-emerald-400 animate-pulse" />
            <span>آماده‌سازی پیش از خواب</span>
          </div>
        )}
      </div>
    </div>
  );
};
