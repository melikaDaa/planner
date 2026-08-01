import React from "react";
import { 
  DailyPlan, 
  WeeklyPlan, 
  DayWeeklyData, 
  TaskItem 
} from "../types";
import { 
  toPersianDigits, 
  getJalaliWeekDays, 
  getJalaliWeekKey, 
  toGregorianDateString,
  PERSIAN_WEEKDAYS,
  getPersianWeekdayIndex,
  gregorianToJalali,
  JALALI_MONTH_NAMES
} from "../utils/jalali";

// Explicit array of Persian weekdays starting strictly from Saturday (شنبه) to Friday (جمعه)
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
  Layers
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
  // Mobile active tab: "all" or index 0..6 for Saturday..Friday
  const [mobileActiveTab, setMobileActiveTab] = React.useState<"all" | number>("all");

  // Get the 7 dates (Sat to Fri) for the active week
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

  // Render a single day card inside the planner spread
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
        className="bg-white dark:bg-[#19241e] border border-[#d6e5dc] dark:border-[#283b30] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-2xl p-3.5 space-y-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
      >
        {/* Day Header */}
        <div className="flex items-center justify-between border-b border-[#e5efe8] dark:border-[#283b30] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>{dayName}</span>
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-900/70 dark:text-emerald-200/70 bg-[#f0f6f2] dark:bg-[#121c17] px-2 py-0.5 rounded-md">
            {dateLabel}
          </span>
        </div>

        {/* 1. Top Priorities */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1b4332] dark:text-[#aee2c2] flex items-center gap-1">
              <Pencil size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span>اولویت‌های اصلی (۳ مورد):</span>
            </span>
          </div>
          <div className="space-y-1.5">
            {[0, 1, 2].map(pIndex => {
              const item = priorities[pIndex] || { text: "", completed: false };
              return (
                <div 
                  key={pIndex} 
                  className="flex items-center gap-2 bg-[#f7faf8] dark:bg-[#111915] border border-[#d3e2d8] dark:border-[#273a2f] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-2.5 py-1.5 transition-all"
                >
                  <span className="bg-emerald-700 dark:bg-emerald-400 text-white dark:text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                    {toPersianDigits(pIndex + 1)}
                  </span>
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
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Tasks */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1b4332] dark:text-[#aee2c2]">کارها و برنامه‌ها:</span>
            <button
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
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Plus size={12} />
              <span>افزودن</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-emerald-400/60 italic py-2 text-center border border-dashed border-[#d3e2d8] dark:border-[#273a2f] rounded-xl bg-[#f9fbf9] dark:bg-[#131d18]">
                کاری برای این روز ثبت نشده است.
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-2 bg-[#f7faf8] dark:bg-[#111915] border border-[#d3e2d8] dark:border-[#273a2f] rounded-xl px-2.5 py-1.5 group hover:border-emerald-400/60 transition-all">
                  <button
                    onClick={() => {
                      handleUpdateDayData(date, (prev) => ({
                        ...prev,
                        tasks: prev.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
                      }));
                    }}
                    className="cursor-pointer focus:outline-none flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle size={15} className="text-slate-400 dark:text-emerald-600/60 hover:text-emerald-600" />
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
                    className={`flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pr-1 font-medium
                      ${task.completed ? "line-through text-slate-400 dark:text-emerald-400/50" : ""}
                    `}
                  />
                  <button
                    onClick={() => {
                      handleUpdateDayData(date, (prev) => ({
                        ...prev,
                        tasks: prev.tasks.filter(t => t.id !== task.id)
                      }));
                    }}
                    className="opacity-60 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 cursor-pointer transition-opacity"
                    title="حذف کار"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Lined Notes */}
        <div className="space-y-1.5 pt-2 border-t border-[#e5efe8] dark:border-[#283b30]">
          <span className="text-xs font-bold text-[#1b4332] dark:text-[#aee2c2] block">یادداشت و نکات این روز:</span>
          <textarea
            value={notes}
            onChange={(e) => {
              const val = e.target.value;
              handleUpdateDayData(date, (prev) => ({ ...prev, notes: val }));
            }}
            placeholder="نکات، قرارها یا یادآوری‌های این روز..."
            className="w-full bg-[#f7faf8] dark:bg-[#111915] border border-[#d3e2d8] dark:border-[#273a2f] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none h-[54px] font-medium"
          />
        </div>

      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto font-sans">
      
      {/* Paper Book Spread Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-6xl bg-[#f4f7f5] dark:bg-[#111915] rounded-3xl p-3 sm:p-5 shadow-2xl border border-[#d5e2da] dark:border-[#22352b] flex flex-col max-h-[92vh] sm:max-h-[90vh] relative"
      >
        {/* Header & Week Navigation */}
        <div className="bg-white dark:bg-[#19241e] border border-[#dce7e0] dark:border-[#25382e] rounded-2xl p-3.5 sm:p-4 mb-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-xl shadow-md shadow-emerald-900/20">
                <Calendar size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">برنامه‌ریزی جامع هفتگی</h2>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70 font-medium">
                  چشم‌انداز و نقشه راه شنبه تا جمعه در یک نگاه
                </p>
              </div>
            </div>

            {/* Close Button on Top Mobile */}
            <button
              id="close-weekly-planner"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#233329] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 text-slate-600 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700/60 transition-all active:scale-95 flex-shrink-0"
              title="بستن"
            >
              <X size={18} />
            </button>
          </div>

          {/* Week Nav Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2 bg-[#f0f5f2] dark:bg-[#121c17] border border-[#d3e2d8] dark:border-[#24372c] p-1.5 rounded-2xl">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-[#19241e] text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-2xs active:scale-95"
              title="هفته قبل"
            >
              <ChevronRight size={18} />
            </button>

            <span className="px-3 py-1 bg-white dark:bg-[#19241e] rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 border border-[#dce7e0] dark:border-[#25382e] text-center shadow-2xs">
              {toPersianDigits(gregorianToJalali(weekDays[0]).jd)} {JALALI_MONTH_NAMES[gregorianToJalali(weekDays[0]).jm - 1]} تا {toPersianDigits(gregorianToJalali(weekDays[6]).jd)} {JALALI_MONTH_NAMES[gregorianToJalali(weekDays[6]).jm - 1]}
            </span>

            <button
              onClick={goToThisWeek}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-white dark:hover:bg-[#19241e] transition-all cursor-pointer active:scale-95"
            >
              این هفته
            </button>

            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-[#19241e] text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-2xs active:scale-95"
              title="هفته بعد"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Weekly Focus & Main Goal Banner */}
        <div className="bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/70 dark:bg-gradient-to-r dark:from-[#16251d] dark:via-[#1c2e24] dark:to-[#16251d] border border-emerald-600/20 dark:border-emerald-500/30 rounded-2xl p-3 sm:p-3.5 mb-3 flex items-center gap-3 shadow-xs flex-shrink-0">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl flex-shrink-0">
            <Target size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block mb-1">
              هدف اصلی و تمرکز محوری این هفته (شنبه تا جمعه):
            </label>
            <input
              type="text"
              value={weeklyGoal}
              onChange={(e) => handleGoalChange(e.target.value)}
              placeholder="مثلا: اتمام پروژه طراحی، ۳ روز ورزش هوازی، مطالعه ۵ فصل کتاب..."
              className="w-full bg-white dark:bg-[#111915] border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Responsive Mobile Tab Bar for Days */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar sm:hidden flex-shrink-0 border-b border-[#dce7e0] dark:border-[#25382e]">
          <button
            onClick={() => setMobileActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              mobileActiveTab === "all"
                ? "bg-emerald-800 text-white dark:bg-emerald-600 shadow-sm"
                : "bg-white dark:bg-[#19241e] text-slate-600 dark:text-slate-300 border border-[#d3e2d8] dark:border-[#25382e]"
            }`}
          >
            <Layers size={13} />
            <span>همه روزها</span>
          </button>
          
          {weekDays.map((dayDate, idx) => {
            const jDate = gregorianToJalali(dayDate);
            const weekdayIdx = getPersianWeekdayIndex(dayDate);
            const dayName = WEEKDAYS_SAT_TO_FRI[weekdayIdx] || PERSIAN_WEEKDAYS[weekdayIdx];
            const isSelected = mobileActiveTab === idx;

            return (
              <button
                key={idx}
                onClick={() => setMobileActiveTab(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-800 text-white dark:bg-emerald-600 shadow-sm"
                    : "bg-white dark:bg-[#19241e] text-slate-700 dark:text-slate-300 border border-[#d3e2d8] dark:border-[#25382e]"
                }`}
              >
                <span>{dayName}</span>
                <span className={`text-[10px] ${isSelected ? "text-emerald-200" : "text-slate-400 dark:text-slate-500"}`}>
                  ({toPersianDigits(jDate.jd)})
                </span>
              </button>
            );
          })}
        </div>

        {/* Days Content Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 sm:space-y-0 mb-3">
          {/* Mobile Single Day View vs All Days View */}
          <div className="block sm:hidden">
            {mobileActiveTab === "all" ? (
              <div className="space-y-3">
                {weekDays.map((dayDate, idx) => renderDayCard(dayDate, idx))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mobile Day Navigation Bar */}
                <div className="flex items-center justify-between bg-white dark:bg-[#19241e] p-2 rounded-xl border border-[#dce7e0] dark:border-[#25382e]">
                  <button
                    disabled={mobileActiveTab === 0}
                    onClick={() => setMobileActiveTab((prev) => (typeof prev === "number" && prev > 0 ? prev - 1 : prev))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#121c17] text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronRight size={14} />
                    <span>روز قبل</span>
                  </button>

                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    روز {toPersianDigits((mobileActiveTab as number) + 1)} از ۷
                  </span>

                  <button
                    disabled={mobileActiveTab === 6}
                    onClick={() => setMobileActiveTab((prev) => (typeof prev === "number" && prev < 6 ? prev + 1 : prev))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#121c17] text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>روز بعد</span>
                    <ChevronLeft size={14} />
                  </button>
                </div>

                {renderDayCard(weekDays[mobileActiveTab as number], mobileActiveTab as number)}
              </div>
            )}
          </div>

          {/* Tablet & Desktop Grid Layout (Always All 7 Days) */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {weekDays.map((dayDate, idx) => renderDayCard(dayDate, idx))}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="bg-white dark:bg-[#19241e] border border-[#dce7e0] dark:border-[#25382e] rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-center sm:text-right text-[11px] sm:text-xs">
              تمام داده‌ها به‌طور هوشمند با صفحات روزانه (شنبه تا جمعه) همگام‌سازی می‌شوند.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 dark:from-emerald-600 dark:to-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95 shadow-sm text-center"
          >
            تأیید و بازگشت به دفترچه
          </button>
        </div>

      </motion.div>
    </div>
  );
};
