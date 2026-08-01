import React from "react";
import { DailyPlan, WeeklyReflection, MonthlyReflection } from "../types";
import { 
  formatPersianDate, 
  toPersianDigits, 
  parseGregorianDateString, 
  getJalaliWeekKey, 
  getJalaliMonthKey 
} from "../utils/jalali";
import { 
  Check, 
  CheckCircle, 
  Sparkles, 
  Award, 
  AlertCircle, 
  X,
  Heart,
  Flame,
  Calendar,
  Smile,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface ReviewPagesProps {
  type: "weekly" | "monthly";
  reviewKey: string; // e.g., "1405-W18" or "1405-M04"
  savedPlans: Record<string, DailyPlan>;
  reflection: any; // WeeklyReflection or MonthlyReflection
  onSaveReflection: (reflection: any) => void;
  onClose: () => void;
}

export const ReviewPages: React.FC<ReviewPagesProps> = ({
  type,
  reviewKey,
  savedPlans,
  reflection,
  onSaveReflection,
  onClose
}) => {
  // 1. Gather all days belonging to this review key
  const relevantDays = React.useMemo(() => {
    return Object.keys(savedPlans)
      .filter((dateStr) => {
        try {
          const date = parseGregorianDateString(dateStr);
          const key = type === "weekly" ? getJalaliWeekKey(date) : getJalaliMonthKey(date);
          return key === reviewKey;
        } catch {
          return false;
        }
      })
      .map((dateStr) => savedPlans[dateStr]);
  }, [savedPlans, reviewKey, type]);

  // 2. Calculate reflective metrics
  const stats = React.useMemo(() => {
    let tasksPlanned = 0;
    let tasksCompleted = 0;
    let habitsPlanned = 0;
    let habitsCompleted = 0;
    
    const goalsAchieved: string[] = [];
    const unfinishedTasks: string[] = [];
    
    interface DayRatio {
      dateStr: string;
      ratio: number;
      label: string;
    }
    const dayRatios: DayRatio[] = [];

    // Calculate weekly streak (consecutive days with completed tasks)
    let currentStreak = 0;
    let maxStreak = 0;

    relevantDays.forEach((day) => {
      let dayTotal = 0;
      let dayCompleted = 0;
      const dateObj = parseGregorianDateString(day.dateKey);
      const verbalDate = formatPersianDate(dateObj).split("،")[1] || formatPersianDate(dateObj);

      // Priorities
      day.priorities?.forEach((p) => {
        if (p.text.trim()) {
          dayTotal++;
          tasksPlanned++;
          if (p.completed) {
            dayCompleted++;
            tasksCompleted++;
            goalsAchieved.push(p.text.trim());
          } else {
            unfinishedTasks.push(p.text.trim());
          }
        }
      });

      // Tasks
      day.tasks?.forEach((t) => {
        if (t.text.trim()) {
          dayTotal++;
          tasksPlanned++;
          if (t.completed) {
            dayCompleted++;
            tasksCompleted++;
          } else {
            unfinishedTasks.push(t.text.trim());
          }
        }
      });

      // Timeline entries
      day.timeline?.forEach((time) => {
        if (time.text.trim()) {
          dayTotal++;
          tasksPlanned++;
          if (time.completed) {
            dayCompleted++;
            tasksCompleted++;
          } else {
            unfinishedTasks.push(time.text.trim());
          }
        }
      });

      // Habits
      day.habits?.forEach((h) => {
        habitsPlanned++;
        dayTotal++;
        if (h.completed) {
          habitsCompleted++;
          dayCompleted++;
        }
      });

      if (dayCompleted > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      if (dayTotal > 0) {
        dayRatios.push({
          dateStr: day.dateKey,
          ratio: dayCompleted / dayTotal,
          label: verbalDate.trim()
        });
      }
    });

    // Most productive day
    let mostProductiveDayLabel = "ثبت نشده";
    if (dayRatios.length > 0) {
      const sorted = [...dayRatios].sort((a, b) => b.ratio - a.ratio);
      if (sorted[0].ratio > 0) {
        mostProductiveDayLabel = sorted[0].label;
      }
    }

    const taskPercent = tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;
    const habitPercent = habitsPlanned > 0 ? Math.round((habitsCompleted / habitsPlanned) * 100) : 0;

    return {
      tasksPlanned,
      tasksCompleted,
      taskPercent,
      habitsPlanned,
      habitsCompleted,
      habitPercent,
      weeklyStreak: maxStreak,
      mostProductiveDayLabel,
      goalsAchieved: Array.from(new Set(goalsAchieved)).slice(0, 5),
      unfinishedTasks: Array.from(new Set(unfinishedTasks)).slice(0, 5)
    };
  }, [relevantDays]);

  // Freeform reflection states
  const [whatWentWell, setWhatWentWell] = React.useState(reflection?.whatWentWell || "");
  const [whatToImprove, setWhatToImprove] = React.useState(reflection?.whatToImprove || "");
  const [biggestAchievement, setBiggestAchievement] = React.useState(reflection?.biggestAchievement || "");
  const [mainFocus, setMainFocus] = React.useState(
    type === "weekly"
      ? (reflection?.mainFocusNextWeek || "")
      : (reflection?.mainFocusNextMonth || "")
  );

  React.useEffect(() => {
    setWhatWentWell(reflection?.whatWentWell || "");
    setWhatToImprove(reflection?.whatToImprove || "");
    setBiggestAchievement(reflection?.biggestAchievement || "");
    setMainFocus(
      type === "weekly"
        ? (reflection?.mainFocusNextWeek || "")
        : (reflection?.mainFocusNextMonth || "")
    );
  }, [reflection, type]);

  const handleSave = () => {
    const updatedReflection = {
      ...reflection,
      weekKey: type === "weekly" ? reviewKey : undefined,
      monthKey: type === "monthly" ? reviewKey : undefined,
      whatWentWell,
      whatToImprove,
      biggestAchievement,
      [type === "weekly" ? "mainFocusNextWeek" : "mainFocusNextMonth"]: mainFocus,
      completedAt: new Date().toISOString()
    };
    onSaveReflection(updatedReflection);
    onClose();
  };

  const titleVerbal = type === "weekly" ? "صفحه بازتاب و مرور هفتگی" : "صفحه بازتاب و مرور ماهانه";
  const periodLabel = type === "weekly" ? "هفته آینده" : "ماه آینده";

  return (
    <div className="fixed inset-0 z-50 bg-[#161d18]/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      
      {/* Paper Review Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl bg-[#e3eae4] dark:bg-[#141d18] rounded-3xl p-3 sm:p-5 shadow-2xl border border-[#cbd8ce] dark:border-[#2d3e33] flex flex-col justify-between min-h-[620px] relative"
      >
        {/* Close Button */}
        <button
          id="close-review-modal"
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-[#1f2c25] hover:bg-[#f2f6f3] dark:hover:bg-[#27382e] text-[#2d3a31] dark:text-[#f0f7f2] cursor-pointer shadow-md border border-[#d2e0d5] dark:border-[#2d3e33] transition-all active:scale-95"
          title="بستن"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 mb-4 paper-shadow flex items-center gap-3">
          <div className="p-2.5 bg-[#2e4f40] text-white rounded-xl shadow-xs">
            <Award size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1a231e] dark:text-[#f0f7f2]">{titleVerbal}</h2>
            <p className="text-xs text-[#526357] dark:text-[#b0d2bc]">
              نگاهی صمیمانه و آرام به مسیر طی‌شده • مرور دستاوردها و تنظیم جهت دوره بعد
            </p>
          </div>
        </div>

        {/* Minimal Reflective Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] p-3 rounded-2xl text-center paper-shadow">
            <span className="text-[10px] font-bold text-[#526357] dark:text-[#b0d2bc] block mb-1">کارهای انجام‌شده</span>
            <span className="text-base font-bold text-[#1a231e] dark:text-[#f0f7f2]">
              {toPersianDigits(stats.tasksCompleted)} <span className="text-xs text-[#829487] dark:text-[#88a896]">از {toPersianDigits(stats.tasksPlanned)}</span>
            </span>
          </div>

          <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] p-3 rounded-2xl text-center paper-shadow">
            <span className="text-[10px] font-bold text-[#526357] dark:text-[#b0d2bc] block mb-1">پایداری عادت‌ها</span>
            <span className="text-base font-bold text-[#2e4f40] dark:text-emerald-400">
              {toPersianDigits(stats.habitPercent)}٪
            </span>
          </div>

          <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] p-3 rounded-2xl text-center paper-shadow">
            <span className="text-[10px] font-bold text-[#526357] dark:text-[#b0d2bc] block mb-1 flex items-center justify-center gap-1">
              <Flame size={12} className="text-emerald-700 dark:text-emerald-400" />
              <span>تسلسل استمرار</span>
            </span>
            <span className="text-base font-bold text-[#2e4f40] dark:text-emerald-400">
              {toPersianDigits(stats.weeklyStreak)} روز
            </span>
          </div>

          <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] p-3 rounded-2xl text-center paper-shadow">
            <span className="text-[10px] font-bold text-[#526357] dark:text-[#b0d2bc] block mb-1">پرپایه‌ترین روز</span>
            <span className="text-xs font-bold text-[#1a231e] dark:text-[#f0f7f2] truncate block py-0.5">
              {stats.mostProductiveDayLabel}
            </span>
          </div>
        </div>

        {/* 4 Core Reflection Questions */}
        <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 mb-4 paper-shadow space-y-4 flex-1">
          <div className="flex items-center gap-1.5 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2">
            <HelpCircle size={16} className="text-[#2e4f40] dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-[#1a231e] dark:text-[#f0f7f2]">پرسش‌های بازتاب شخصی (Self-Reflection)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question 1 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3a31] dark:text-[#aee2c2] block">
                ۱. چه چیزهایی در این دوره خوب پیش رفت؟
              </label>
              <textarea
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder="اتفاقات مثبت، برنامه‌هایی که طبق زمان انجام شد..."
                className="w-full bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl p-2.5 text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] focus:ring-2 focus:ring-[#2e4f40]/20 resize-none h-[75px] leading-relaxed font-medium"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3a31] dark:text-[#aee2c2] block">
                ۲. چه مواردی باید برای {periodLabel} بهتر شود؟
              </label>
              <textarea
                value={whatToImprove}
                onChange={(e) => setWhatToImprove(e.target.value)}
                placeholder="عواملی که تمرکزتان را بهم زد یا نیاز به بهبود دارد..."
                className="w-full bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl p-2.5 text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] focus:ring-2 focus:ring-[#2e4f40]/20 resize-none h-[75px] leading-relaxed font-medium"
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3a31] dark:text-[#aee2c2] block">
                ۳. بزرگ‌ترین دستاورد این دوره چه بود؟
              </label>
              <textarea
                value={biggestAchievement}
                onChange={(e) => setBiggestAchievement(e.target.value)}
                placeholder="موفقیت یا حس افتخاری که در این مدت کسب کردید..."
                className="w-full bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl p-2.5 text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] focus:ring-2 focus:ring-[#2e4f40]/20 resize-none h-[75px] leading-relaxed font-medium"
              />
            </div>

            {/* Question 4 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3a31] dark:text-[#aee2c2] block">
                ۴. تمرکز اصلی برای {periodLabel} چیست؟
              </label>
              <textarea
                value={mainFocus}
                onChange={(e) => setMainFocus(e.target.value)}
                placeholder={`یک یا دو هدف اصلی که کل ${periodLabel} بر پایه آن خواهد بود...`}
                className="w-full bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl p-2.5 text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] focus:ring-2 focus:ring-[#2e4f40]/20 resize-none h-[75px] leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-3 flex items-center justify-between text-xs text-[#526357] dark:text-[#b0d2bc] paper-shadow">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#2e4f40] dark:text-emerald-400" />
            <span>گزارش بازتاب شما به‌طور ایمن در مرورگر ذخیره می‌گردد.</span>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#2e4f40] text-white hover:bg-[#233f33] rounded-xl font-bold cursor-pointer transition-all active:scale-95 shadow-xs flex items-center gap-1.5"
          >
            <Check size={16} />
            <span>ثبت بازتاب و ذخیره</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
