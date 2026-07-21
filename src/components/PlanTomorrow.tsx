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
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-5 paper-shadow font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-[#f5ebe0] pb-2">
        <div className="flex items-center gap-2">
          <NotebookPen size={18} className="text-[#c5a880]" />
          <h3 className="text-base font-semibold text-[#574f41]">برنامه‌ریزی برای فردا</h3>
        </div>
        
        {hasText && (
          <button
            id="promote-tomorrow-btn"
            type="button"
            onClick={onPromoteToTomorrow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#eae0d5] text-[#574f41] hover:bg-[#ebdccb] rounded-xl text-xs font-semibold cursor-pointer transition-colors active:scale-95"
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
          className="w-full bg-white border border-[#f5ebe0] rounded-xl p-3.5 text-sm text-[#44403c] placeholder-[#bcaf9c] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-all resize-none leading-relaxed"
        />
        
        {!hasText && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-[#a89a7a] pointer-events-none">
            <Sparkles size={11} className="animate-pulse" />
            <span>آماده‌سازی پیش از خواب</span>
          </div>
        )}
      </div>
    </div>
  );
};
