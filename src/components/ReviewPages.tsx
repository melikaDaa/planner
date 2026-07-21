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
  BookOpen, 
  Check, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  ChevronLeft, 
  X,
  FileText
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

  // 2. Calculate real-time statistics
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

      // Simple tasks
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

      if (dayTotal > 0) {
        dayRatios.push({
          dateStr: day.dateKey,
          ratio: dayCompleted / dayTotal,
          label: verbalDate.trim()
        });
      }
    });

    // Determine most productive day
    let mostProductiveDayLabel = "—";
    if (dayRatios.length > 0) {
      const sorted = [...dayRatios].sort((a, b) => b.ratio - a.ratio);
      if (sorted[0].ratio > 0) {
        mostProductiveDayLabel = sorted[0].label;
      }
    }

    // Determine completion rates
    const taskPercent = tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;
    const habitPercent = habitsPlanned > 0 ? Math.round((habitsCompleted / habitsPlanned) * 100) : 0;
    const totalPercent = (tasksPlanned + habitsPlanned) > 0 
      ? Math.round(((tasksCompleted + habitsCompleted) / (tasksPlanned + habitsPlanned)) * 100) 
      : 0;

    // Motivational Quote Choice
    let motivationalText = "هنوز داده‌ای ثبت نشده است. هفته را با آرامش آغاز کنید.";
    if (totalPercent > 75) {
      motivationalText = "پیگیری فوق‌العاده‌ای داشتید! تمرکز و انضباط شما در نوشتن و اجرای اهدافتان ستودنی است.";
    } else if (totalPercent > 40) {
      motivationalText = "تعادل بسیار خوبی برقرار است. همین مسیر پیوسته و بدون شتاب، راز اصلی ماندگاری است.";
    } else if (totalPercent > 0) {
      motivationalText = "بازنگری کارهای انجام‌نشده، خود نیمی از راه رشد است. برای روزهای آینده صبور و مهربان باشید.";
    }

    return {
      tasksPlanned,
      tasksCompleted,
      taskPercent,
      habitsPlanned,
      habitsCompleted,
      habitPercent,
      mostProductiveDayLabel,
      goalsAchieved: Array.from(new Set(goalsAchieved)).slice(0, 5),
      unfinishedTasks: Array.from(new Set(unfinishedTasks)).slice(0, 5),
      motivationalText,
      totalPercent
    };
  }, [relevantDays, type]);

  // Local state for freeform reflection inputs
  const [whatWentWell, setWhatWentWell] = React.useState(reflection?.whatWentWell || "");
  const [whatToImprove, setWhatToImprove] = React.useState(reflection?.whatToImprove || "");
  const [mainFocus, setMainFocus] = React.useState(
    reflection?.mainFocusNextWeek || reflection?.mainFocusNextMonth || ""
  );

  React.useEffect(() => {
    setWhatWentWell(reflection?.whatWentWell || "");
    setWhatToImprove(reflection?.whatToImprove || "");
    setMainFocus(reflection?.mainFocusNextWeek || reflection?.mainFocusNextMonth || "");
  }, [reflection]);

  const handleSave = () => {
    const updatedReflection = {
      ...reflection,
      weekKey: type === "weekly" ? reviewKey : undefined,
      monthKey: type === "monthly" ? reviewKey : undefined,
      whatWentWell,
      whatToImprove,
      [type === "weekly" ? "mainFocusNextWeek" : "mainFocusNextMonth"]: mainFocus,
      completedAt: new Date().toISOString()
    };
    onSaveReflection(updatedReflection);
    onClose();
  };

  const titleVerbal = type === "weekly" ? "مرور هفتگی" : "مرور ماهانه";
  const descVerbal = type === "weekly" 
    ? "زمانی برای تنفس، بازنگری و تنظیم آرام اهداف هفته آینده" 
    : "گامی کوتاه برای نگاه به مسیر سپری‌شده و بازیابی تمرکز ماهانه";

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1a15]/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      
      {/* Notebook Spread Layout */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-5xl bg-[#e6ded5] rounded-3xl p-2.5 sm:p-4 shadow-2xl border border-[#dbcfc2] min-h-[600px] grid grid-cols-1 md:grid-cols-21 relative"
      >
        {/* Close Button */}
        <button
          id="close-review-modal"
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white text-[#574f41] cursor-pointer shadow-md border border-[#eaddcf] transition-all active:scale-95"
          title="بستن و ورود به دفترچه"
        >
          <X size={16} />
        </button>

        {/* LEFT PAGE - Performance & Notebook statistics */}
        <div className="md:col-span-10 flex flex-col bg-[#fcfbf9] rounded-2xl p-5 sm:p-7 left-page-curl border border-[#eaddcf] relative overflow-hidden">
          
          {/* Notebook line detail */}
          <div className="absolute right-10 top-0 bottom-0 w-[1px] border-r border-[#fca5a5] opacity-40 pointer-events-none" />

          <div className="space-y-6 relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b border-[#f5ebe0] pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-[#8c7851]/10 rounded-lg text-[#8c7851]">
                  <Award size={18} />
                </div>
                <h2 className="text-xl font-bold text-[#44403c]">{titleVerbal}</h2>
              </div>
              <p className="text-xs text-[#8c7a5c] leading-relaxed">{descVerbal}</p>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#faf7f2] border border-[#f2e7da] p-3 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-[#8c7a5c] mb-1">کارهای انجام شده</span>
                <span className="text-lg font-bold text-[#44403c] font-mono">
                  {toPersianDigits(stats.tasksCompleted)} <span className="text-xs font-normal text-[#a89a7a]">از</span> {toPersianDigits(stats.tasksPlanned)}
                </span>
                <div className="w-full bg-[#eae0d5] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#8c7851] h-full rounded-full transition-all" style={{ width: `${stats.taskPercent}%` }} />
                </div>
              </div>

              <div className="bg-[#faf7f2] border border-[#f2e7da] p-3 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-[#8c7a5c] mb-1">پایداری عادت‌ها</span>
                <span className="text-lg font-bold text-[#44403c] font-mono">
                  {toPersianDigits(stats.habitsCompleted)} <span className="text-xs font-normal text-[#a89a7a]">بار</span>
                </span>
                <div className="w-full bg-[#eae0d5] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${stats.habitPercent}%` }} />
                </div>
              </div>

              <div className="bg-[#faf7f2] border border-[#f2e7da] p-3 rounded-xl text-center flex flex-col justify-between">
                <span className="block text-[10px] font-bold text-[#8c7a5c] mb-1">روز با تمرکز کامل</span>
                <span className="text-xs font-bold text-[#8c7851] truncate py-1.5">
                  {stats.mostProductiveDayLabel}
                </span>
                <span className="text-[9px] text-[#bcaf9c]">بیشترین درصد تکمیل</span>
              </div>
            </div>

            {/* Encouraging Quote Block */}
            <div className="bg-[#f5ebe0]/40 border border-[#ecdccb]/80 p-3.5 rounded-xl text-right">
              <div className="flex items-center gap-1.5 mb-1 text-[#8c7851]">
                <Sparkles size={14} />
                <span className="text-xs font-bold">پیشرفت مسیر شما</span>
              </div>
              <p className="text-xs text-[#574f41] leading-relaxed">{stats.motivationalText}</p>
            </div>

            {/* Goals Achieved Lists */}
            <div className="space-y-3 flex-1">
              <div>
                <h4 className="text-xs font-bold text-[#8c7a5c] flex items-center gap-1.5 mb-2">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <span>برخی اهداف محقق شده این دوره:</span>
                </h4>
                {stats.goalsAchieved.length === 0 ? (
                  <p className="text-xs text-[#bcaf9c] italic pr-5">هنوز هدفی تکمیل نشده است.</p>
                ) : (
                  <ul className="space-y-1.5 pr-4">
                    {stats.goalsAchieved.map((goal, idx) => (
                      <li key={idx} className="text-xs text-[#574f41] flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="truncate">{goal}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Tasks left unfinished */}
              <div className="pt-2 border-t border-[#f5ebe0]">
                <h4 className="text-xs font-bold text-[#8c7a5c] flex items-center gap-1.5 mb-2">
                  <AlertCircle size={13} className="text-[#c5a880]" />
                  <span>کارهای مانده برای دوره بعد:</span>
                </h4>
                {stats.unfinishedTasks.length === 0 ? (
                  <p className="text-xs text-[#bcaf9c] italic pr-5">همه کارها با موفقیت به اتمام رسیده‌اند! 🎉</p>
                ) : (
                  <ul className="space-y-1.5 pr-4">
                    {stats.unfinishedTasks.map((task, idx) => (
                      <li key={idx} className="text-xs text-[#6b6661] flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-[#c5b394] rounded-full mt-1.5 flex-shrink-0" />
                        <span className="truncate">{task}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* CENTER SPIRAL WIRE (Column 11 on Desktop) */}
        <div className="hidden md:flex md:col-span-1 flex-col justify-center items-center z-20 pointer-events-none">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-between h-9 my-2.5">
              <div className="w-4 h-3 bg-gradient-to-r from-[#cbd5e1] via-[#f1f5f9] to-[#94a3b8] rounded-full shadow border border-[#b8c2cc]" />
              <div className="flex justify-between w-8 -mt-1 z-10">
                <div className="w-2 h-2 bg-[#45403a] rounded-full shadow-inner opacity-75" />
                <div className="w-2 h-2 bg-[#45403a] rounded-full shadow-inner opacity-75" />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PAGE - Freeform writing inputs / reflections */}
        <div className="md:col-span-10 flex flex-col bg-[#fcfbf9] rounded-2xl p-5 sm:p-7 right-page-curl border border-[#eaddcf] relative overflow-hidden">
          
          {/* Notebook line detail */}
          <div className="absolute left-10 top-0 bottom-0 w-[1px] border-l border-[#fca5a5] opacity-40 pointer-events-none" />

          <div className="space-y-5 relative z-10 flex-1 flex flex-col justify-between">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#44403c] border-b border-[#f5ebe0] pb-2 flex items-center gap-1.5">
                <FileText size={16} className="text-[#8c7851]" />
                <span>برگ بازتاب و یادداشت شخصی</span>
              </h3>

              {/* Box 1: What went well? */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#574f41] block">چه چیزهایی در این دوره خوب پیش رفت؟</label>
                <div className="lined-paper rounded-xl border border-[#eaddcf] bg-[#fdfdfc] p-2 min-h-[90px]">
                  <textarea
                    id="well-textarea"
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    placeholder="مثلاً: تعادل خواب، تمرکز مستمر روی اولویت اول..."
                    className="w-full bg-transparent border-none focus:outline-none text-xs text-[#44403c] placeholder-[#d0c6b8] resize-none leading-7"
                    rows={3}
                  />
                </div>
              </div>

              {/* Box 2: What could be improved? */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#574f41] block">چه مواردی نیاز به بهبود یا برنامه‌ریزی بهتر دارد؟</label>
                <div className="lined-paper rounded-xl border border-[#eaddcf] bg-[#fdfdfc] p-2 min-h-[90px]">
                  <textarea
                    id="improve-textarea"
                    value={whatToImprove}
                    onChange={(e) => setWhatToImprove(e.target.value)}
                    placeholder="مثلاً: مدیریت زمان‌های اتلاف‌شده در غروب..."
                    className="w-full bg-transparent border-none focus:outline-none text-xs text-[#44403c] placeholder-[#d0c6b8] resize-none leading-7"
                    rows={3}
                  />
                </div>
              </div>

              {/* Box 3: Next period focus */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#574f41] block">
                  {type === "weekly" ? "تمرکز یا هدف اصلی هفته آینده چیست؟" : "اهداف و تمرکز محوری ماه آینده چیست؟"}
                </label>
                <div className="lined-paper rounded-xl border border-[#eaddcf] bg-[#fdfdfc] p-2 min-h-[90px]">
                  <textarea
                    id="focus-textarea"
                    value={mainFocus}
                    onChange={(e) => setMainFocus(e.target.value)}
                    placeholder="یک یا دو کار محوری که تمام تمرکزتان را روی آن می‌گذارید..."
                    className="w-full bg-transparent border-none focus:outline-none text-xs text-[#44403c] placeholder-[#d0c6b8] resize-none leading-7"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Save & Finish Button */}
            <div className="pt-4 border-t border-[#f5ebe0] flex items-center justify-end">
              <button
                id="save-review-btn"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#8c7851] text-white hover:bg-[#7c6a46] rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md active:scale-95"
              >
                <Check size={14} className="stroke-[3]" />
                <span>ثبت بازنگری و ورود به دفترچه</span>
              </button>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
};
