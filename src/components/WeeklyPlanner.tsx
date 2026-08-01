import React from "react";
import { 
  DailyPlan, 
  WeeklyPlan, 
  DayWeeklyData, 
  PriorityItem, 
  TaskItem 
} from "../types";
import { 
  formatPersianDate, 
  toPersianDigits, 
  getJalaliWeekDays, 
  getJalaliWeekKey, 
  toGregorianDateString,
  PERSIAN_WEEKDAYS,
  getPersianWeekdayIndex,
  gregorianToJalali,
  JALALI_MONTH_NAMES
} from "../utils/jalali";

// Explicit array of Persian weekdays starting from Saturday (شنبه) to Friday (جمعه)
const WEEKDAYS_SAT_TO_FRI = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه"
];
import { 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Pencil, 
  Target, 
  X, 
  Sparkles,
  FileText,
  RotateCcw
} from "lucide-react";
import { motion } from "motion/react";

interface WeeklyPlannerProps {
  currentDate: Date;
  savedPlans: Record<string, DailyPlan>;
  weeklyPlans: Record<string, WeeklyPlan>;
  onSaveWeeklyPlan: (weekKey: string, plan: WeeklyPlan) => void;
  onSyncDailyPlan: (dateKey: string, updatedPlan: DailyPlan) => void;
  onClose: () => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  currentDate,
  savedPlans,
  weeklyPlans,
  onSaveWeeklyPlan,
  onSyncDailyPlan,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(currentDate);

  // Get the 7 dates (Sat to Fri) for the active week, strictly starting on Saturday (شنبه) to Friday (جمعه)
  const weekDays = React.useMemo(() => {
    const days = getJalaliWeekDays(selectedDate);
    // Ensure days are strictly ordered chronologically from Saturday (index 0) to Friday (index 6)
    return [...days].sort((a, b) => a.getTime() - b.getTime());
  }, [selectedDate]);

  const weekKey = React.useMemo(() => {
    return getJalaliWeekKey(selectedDate);
  }, [selectedDate]);

  // Retrieve or initialize current weekly plan
  const currentWeeklyPlan = React.useMemo(() => {
    return weeklyPlans[weekKey] || {
      weekKey,
      weeklyGoal: "",
      days: {}
    };
  }, [weeklyPlans, weekKey]);

  const [weeklyGoal, setWeeklyGoal] = React.useState(currentWeeklyPlan.weeklyGoal || "");

  React.useEffect(() => {
    setWeeklyGoal(currentWeeklyPlan.weeklyGoal || "");
  }, [currentWeeklyPlan]);

  const handleGoalChange = (val: string) => {
    setWeeklyGoal(val);
    const updated: WeeklyPlan = {
      ...currentWeeklyPlan,
      weeklyGoal: val
    };
    onSaveWeeklyPlan(weekKey, updated);
  };

  // Week navigation
  const goToPreviousWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
  };

  const goToThisWeek = () => {
    setSelectedDate(new Date());
  };

  // Sync a specific day's weekly entries into the DailyPlan state
  const handleUpdateDayData = (date: Date, updater: (prev: DayWeeklyData) => DayWeeklyData) => {
    const dateKey = toGregorianDateString(date);
    const existingDaily = savedPlans[dateKey] || {
      dateKey,
      priorities: [{ text: "", completed: false }, { text: "", completed: false }, { text: "", completed: false }],
      tasks: [],
      timeline: [],
      habits: [],
      mood: "",
      energy: 0,
      notes: "",
      planTomorrow: "",
      reminders: []
    };

    const currentDayWeekly: DayWeeklyData = currentWeeklyPlan.days[dateKey] || {
      priorities: existingDaily.priorities || [{ text: "", completed: false }, { text: "", completed: false }, { text: "", completed: false }],
      tasks: existingDaily.tasks || [],
      notes: existingDaily.notes || ""
    };

    const updatedDayWeekly = updater(currentDayWeekly);

    // Update WeeklyPlan state
    const updatedWeeklyPlan: WeeklyPlan = {
      ...currentWeeklyPlan,
      days: {
        ...currentWeeklyPlan.days,
        [dateKey]: updatedDayWeekly
      }
    };
    onSaveWeeklyPlan(weekKey, updatedWeeklyPlan);

    // Sync directly to DailyPlan state so daily views match seamlessly
    const updatedDailyPlan: DailyPlan = {
      ...existingDaily,
      priorities: updatedDayWeekly.priorities,
      tasks: updatedDayWeekly.tasks,
      notes: updatedDayWeekly.notes || existingDaily.notes
    };
    onSyncDailyPlan(dateKey, updatedDailyPlan);
  };

  // Render a single day column inside the paper planner spread
  const renderDayCard = (date: Date, index: number) => {
    const dateKey = toGregorianDateString(date);
    const jDate = gregorianToJalali(date);
    const dateLabel = `${toPersianDigits(jDate.jd)} ${JALALI_MONTH_NAMES[jDate.jm - 1]}`;
    const weekdayIdx = getPersianWeekdayIndex(date);
    const dayName = WEEKDAYS_SAT_TO_FRI[weekdayIdx] || PERSIAN_WEEKDAYS[weekdayIdx];
    
    // Day data combined from WeeklyPlan or savedPlans
    const daily = savedPlans[dateKey];
    const weeklyData = currentWeeklyPlan.days[dateKey];

    const priorities = weeklyData?.priorities || daily?.priorities || [
      { text: "", completed: false },
      { text: "", completed: false },
      { text: "", completed: false }
    ];

    const tasks = weeklyData?.tasks || daily?.tasks || [];
    const notes = weeklyData?.notes || daily?.notes || "";

    return (
      <div 
        key={dateKey} 
        className="bg-[#f8faf8] dark:bg-[#1c2822] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-3.5 space-y-3 paper-shadow flex flex-col justify-between"
      >
        {/* Day Title Header */}
        <div className="flex items-center justify-between border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2e4f40] dark:bg-emerald-400" />
            <h4 className="text-sm font-bold text-[#1a231e] dark:text-[#f0f7f2]">{dayName}</h4>
          </div>
          <span className="text-[11px] text-[#526357] dark:text-[#b0d2bc] font-medium">
            {dateLabel}
          </span>
        </div>

        {/* 1. Top Priorities */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#2e4f40] dark:text-[#aee2c2] flex items-center justify-between">
            <span>اولویت‌های اصلی (۳ مورد):</span>
            <Pencil size={10} className="text-[#526357] dark:text-[#b0d2bc]" />
          </span>
          <div className="space-y-1">
            {[0, 1, 2].map(pIndex => {
              const item = priorities[pIndex] || { text: "", completed: false };
              return (
                <div key={pIndex} className="flex items-center gap-1.5 bg-white dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-lg px-2 py-1">
                  <span className="text-[10px] font-bold text-[#526357] dark:text-[#b0d2bc] select-none">{toPersianDigits(pIndex + 1)}</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      handleUpdateDayData(date, (prev) => {
                        const updatedP = [...(prev.priorities || [])];
                        while (updatedP.length < 3) updatedP.push({ text: "", completed: false });
                        updatedP[pIndex] = { ...updatedP[pIndex], text: newText };
                        return { ...prev, priorities: updatedP };
                      });
                    }}
                    placeholder={`اولویت ${toPersianDigits(pIndex + 1)}...`}
                    className="w-full bg-transparent text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#85aa93] focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Tasks */}
        <div className="space-y-1.5 flex-1">
          <span className="text-[10px] font-bold text-[#2e4f40] dark:text-[#aee2c2] flex items-center justify-between">
            <span>کارها و برنامه‌ها:</span>
            <Plus 
              size={12} 
              className="text-[#2e4f40] dark:text-[#aee2c2] cursor-pointer hover:scale-110 transition-transform" 
              onClick={() => {
                handleUpdateDayData(date, (prev) => {
                  const newTask: TaskItem = {
                    id: crypto.randomUUID(),
                    text: "",
                    completed: false
                  };
                  return { ...prev, tasks: [...(prev.tasks || []), newTask] };
                });
              }}
            />
          </span>

          <div className="space-y-1 max-h-[110px] overflow-y-auto pr-0.5">
            {tasks.length === 0 ? (
              <p className="text-[10px] text-[#829487] dark:text-[#9fc4ae] italic py-1 text-center border border-dashed border-[#d2e0d5] dark:border-[#2d3e33] rounded-lg">
                کاری ثبت نشده است.
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-1 bg-white dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-lg px-2 py-1 group">
                  <button
                    onClick={() => {
                      handleUpdateDayData(date, (prev) => ({
                        ...prev,
                        tasks: prev.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
                      }));
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle size={13} className="text-[#829487] dark:text-[#9fc4ae]" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      handleUpdateDayData(date, (prev) => ({
                        ...prev,
                        tasks: prev.tasks.map(t => t.id === task.id ? { ...t, text: newText } : t)
                      }));
                    }}
                    placeholder="عنوان کار..."
                    className={`flex-1 bg-transparent text-[11px] text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#85aa93] focus:outline-none pr-1
                      ${task.completed ? "line-through text-slate-400 dark:text-emerald-400/60 font-normal" : ""}
                    `}
                  />
                  <button
                    onClick={() => {
                      handleUpdateDayData(date, (prev) => ({
                        ...prev,
                        tasks: prev.tasks.filter(t => t.id !== task.id)
                      }));
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-[#829487] dark:text-[#9fc4ae] hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Lined Notes */}
        <div className="space-y-1 pt-1 border-t border-[#e2ece4] dark:border-[#2d3e33]">
          <span className="text-[10px] font-bold text-[#2e4f40] dark:text-[#aee2c2]">یادداشت روزانه:</span>
          <textarea
            value={notes}
            onChange={(e) => {
              const val = e.target.value;
              handleUpdateDayData(date, (prev) => ({ ...prev, notes: val }));
            }}
            placeholder="نکات، قرارها یا یادآوری‌ها..."
            className="w-full bg-white dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-lg p-1.5 text-[11px] text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#85aa93] focus:outline-none resize-none h-[52px]"
          />
        </div>

      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#161d18]/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto font-sans">
      
      {/* Paper Book Spread Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-6xl bg-[#e3eae4] dark:bg-[#141d18] rounded-3xl p-3 sm:p-5 shadow-2xl border border-[#cbd8ce] dark:border-[#2d3e33] flex flex-col justify-between min-h-[720px] relative"
      >
        {/* Top Floating Close Button */}
        <button
          id="close-weekly-planner"
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-[#1f2c25] hover:bg-[#f2f6f3] dark:hover:bg-[#27382e] text-[#2d3a31] dark:text-[#eef4f0] cursor-pointer shadow-md border border-[#d2e0d5] dark:border-[#2d3e33] transition-all active:scale-95"
          title="بازگشت به نمای روزانه"
        >
          <X size={18} />
        </button>

        {/* Header & Week Nav */}
        <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 mb-4 paper-shadow flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2e4f40] text-white rounded-xl shadow-xs">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1a231e] dark:text-[#f0f7f2]">برنامه‌ریزی جامع هفتگی</h2>
              <p className="text-xs text-[#526357] dark:text-[#b4d0bd]">
                چشم‌انداز و نقشه راه شنبه تا جمعه در یک نگاه کاغذی
              </p>
            </div>
          </div>

          {/* Week Nav Buttons */}
          <div className="flex items-center gap-2 bg-[#f8faf8] dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] p-1 rounded-xl">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1f2c25] text-[#2d3a31] dark:text-[#f0f7f2] cursor-pointer transition-all"
              title="هفته قبل"
            >
              <ChevronRight size={18} />
            </button>

            <span className="px-3 py-1 bg-white dark:bg-[#1f2c25] rounded-lg text-xs font-bold text-[#2d3a31] dark:text-[#f0f7f2] border border-[#d2e0d5] dark:border-[#2d3e33]">
              هفته: {toPersianDigits(gregorianToJalali(weekDays[0]).jd)} {JALALI_MONTH_NAMES[gregorianToJalali(weekDays[0]).jm - 1]} تا {toPersianDigits(gregorianToJalali(weekDays[6]).jd)} {JALALI_MONTH_NAMES[gregorianToJalali(weekDays[6]).jm - 1]}
            </span>

            <button
              onClick={goToThisWeek}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#2e4f40] dark:text-[#aee2c2] hover:bg-white dark:hover:bg-[#1f2c25] transition-all cursor-pointer"
            >
              این هفته
            </button>

            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1f2c25] text-[#2d3a31] dark:text-[#f0f7f2] cursor-pointer transition-all"
              title="هفته بعد"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Weekly Focus & Main Goal Banner */}
        <div className="bg-[#f8faf8] dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-3.5 mb-4 flex items-center gap-3 paper-shadow">
          <Target size={20} className="text-[#2e4f40] dark:text-[#aee2c2] flex-shrink-0" />
          <div className="flex-1">
            <label className="text-xs font-bold text-[#526357] dark:text-[#b4d0bd] block mb-1">
              هدف اصلی و تمرکز محوری این هفته (شنبه تا جمعه):
            </label>
            <input
              type="text"
              value={weeklyGoal}
              onChange={(e) => handleGoalChange(e.target.value)}
              placeholder="مثلا: اتمام پروژه طراحی، ۳ روز ورزش هوازی، مطالعه ۵ فصل کتاب..."
              className="w-full bg-white dark:bg-[#141d18] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-xl px-3 py-1.5 text-xs text-[#1a231e] dark:text-[#f0f7f2] placeholder-[#829487] dark:placeholder-[#88a896] focus:outline-none focus:border-[#2e4f40] focus:ring-2 focus:ring-[#2e4f40]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Double-Page Spread: 7 Days Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 mb-4">
          {weekDays.map((dayDate, idx) => renderDayCard(dayDate, idx))}
        </div>

        {/* Bottom Actions Footer */}
        <div className="bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-3 flex items-center justify-between text-xs text-[#526357] dark:text-[#b4d0bd] paper-shadow">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#2e4f40] dark:text-[#a8c2b2]" />
            <span>تمام اطلاعات وارد شده به‌طور خودکار در صفحات روزانه (شنبه تا جمعه) اعمال می‌شوند.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2e4f40] text-white hover:bg-[#233f33] rounded-xl font-bold cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            تأیید و ورود به دفترچه روزانه
          </button>
        </div>

      </motion.div>
    </div>
  );
};
