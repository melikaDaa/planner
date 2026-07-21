import React from "react";
import { 
  formatPersianDate, 
  toGregorianDateString, 
  gregorianToJalali, 
  toPersianDigits,
  getJalaliWeekKey,
  getJalaliMonthKey,
  getDaysInJalaliMonth,
  getPersianWeekdayIndex
} from "./utils/jalali";
import { 
  DailyPlan, 
  HabitDefinition, 
  TaskItem, 
  WeeklyReflection, 
  MonthlyReflection,
  ReminderItem
} from "./types";
import { PersianCalendar } from "./components/PersianCalendar";
import { PrioritiesList } from "./components/PrioritiesList";
import { TaskList } from "./components/TaskList";
import { HabitTracker } from "./components/HabitTracker";
import { TimelineSchedule } from "./components/TimelineSchedule";
import { MoodAndEnergy } from "./components/MoodAndEnergy";
import { PlanTomorrow } from "./components/PlanTomorrow";
import { ReminderSystem } from "./components/ReminderSystem";
import { ReviewPages } from "./components/ReviewPages";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  RotateCcw, 
  ClipboardCheck, 
  FileText,
  Bookmark,
  Sparkles,
  ArrowRightLeft,
  Bell
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const LOCAL_STORAGE_PLANS_KEY = "persian_notebook_plans_v1";
const LOCAL_STORAGE_HABITS_KEY = "persian_notebook_habits_v1";
const LOCAL_STORAGE_WEEKLY_KEY = "persian_notebook_weekly_v1";
const LOCAL_STORAGE_MONTHLY_KEY = "persian_notebook_monthly_v1";

const DEFAULT_HABITS: HabitDefinition[] = [
  { id: "h1", name: "مطالعه کتاب (۲۰ صفحه)" },
  { id: "h2", name: "نوشیدن ۸ لیوان آب" },
  { id: "h3", name: "ورزش روزانه (۳۰ دقیقه)" },
  { id: "h4", name: "مدیتیشن و تنفس عمیق" }
];

export default function App() {
  const [activeDate, setActiveDate] = React.useState<Date>(() => new Date());
  const [savedPlans, setSavedPlans] = React.useState<Record<string, DailyPlan>>({});
  const [habitDefinitions, setHabitDefinitions] = React.useState<HabitDefinition[]>([]);
  const [weeklyReflections, setWeeklyReflections] = React.useState<Record<string, WeeklyReflection>>({});
  const [monthlyReflections, setMonthlyReflections] = React.useState<Record<string, MonthlyReflection>>({});
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<number>(0); 
  
  // Mobile active tab: 'planner' | 'notes_schedule' | 'calendar_habits'
  const [mobileTab, setMobileTab] = React.useState<'planner' | 'notes_schedule' | 'calendar_habits'>('planner');

  // Review Page triggers
  const [activeReview, setActiveReview] = React.useState<{ type: "weekly" | "monthly"; key: string } | null>(null);

  // Load initial data from LocalStorage
  React.useEffect(() => {
    try {
      const storedPlans = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
      if (storedPlans) {
        setSavedPlans(JSON.parse(storedPlans));
      }
      
      const storedHabits = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
      if (storedHabits) {
        setHabitDefinitions(JSON.parse(storedHabits));
      } else {
        setHabitDefinitions(DEFAULT_HABITS);
        localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
      }

      const storedWeekly = localStorage.getItem(LOCAL_STORAGE_WEEKLY_KEY);
      if (storedWeekly) {
        setWeeklyReflections(JSON.parse(storedWeekly));
      }

      const storedMonthly = localStorage.getItem(LOCAL_STORAGE_MONTHLY_KEY);
      if (storedMonthly) {
        setMonthlyReflections(JSON.parse(storedMonthly));
      }
    } catch (e) {
      console.error("Error loading local storage:", e);
      setHabitDefinitions(DEFAULT_HABITS);
    }
  }, []);

  // Save plans to local storage
  const savePlan = (dateKey: string, updatedPlan: DailyPlan) => {
    const updated = {
      ...savedPlans,
      [dateKey]: updatedPlan
    };
    setSavedPlans(updated);
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(updated));
  };

  // Helper to trigger custom handwritten sticky toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Date Key for currently active day
  const activeDateKey = React.useMemo(() => {
    return toGregorianDateString(activeDate);
  }, [activeDate]);

  // Current Jalali Details
  const activeJalali = React.useMemo(() => {
    return gregorianToJalali(activeDate);
  }, [activeDate]);

  const isFriday = React.useMemo(() => {
    return getPersianWeekdayIndex(activeDate) === 6;
  }, [activeDate]);

  const isEndOfMonth = React.useMemo(() => {
    const totalDays = getDaysInJalaliMonth(activeJalali.jy, activeJalali.jm);
    return activeJalali.jd === totalDays;
  }, [activeJalali]);

  // Automatic Weekly/Monthly Review Trigger
  React.useEffect(() => {
    const weekKey = getJalaliWeekKey(activeDate);
    if (isFriday && !weeklyReflections[weekKey] && !activeReview) {
      setActiveReview({ type: "weekly", key: weekKey });
    }
  }, [activeDate, isFriday, weeklyReflections, activeReview]);

  React.useEffect(() => {
    const monthKey = getJalaliMonthKey(activeDate);
    if (isEndOfMonth && !monthlyReflections[monthKey] && !activeReview) {
      setActiveReview({ type: "monthly", key: monthKey });
    }
  }, [activeDate, isEndOfMonth, monthlyReflections, activeReview]);

  // Load / Initialize data for the active date
  const currentPlan = React.useMemo(() => {
    const plan = savedPlans[activeDateKey];
    
    const mergedHabits = habitDefinitions.map(def => {
      const existing = plan?.habits?.find(h => h.id === def.id);
      return {
        id: def.id,
        name: def.name,
        completed: existing ? existing.completed : false
      };
    });

    if (plan) {
      return {
        ...plan,
        habits: mergedHabits,
        reminders: plan.reminders || []
      };
    }

    return {
      dateKey: activeDateKey,
      priorities: [
        { text: "", completed: false },
        { text: "", completed: false },
        { text: "", completed: false }
      ],
      tasks: [],
      timeline: [],
      habits: mergedHabits,
      mood: "",
      energy: 0,
      notes: "",
      planTomorrow: "",
      reminders: []
    };
  }, [activeDateKey, savedPlans, habitDefinitions]);

  // Handle field updates for active date
  const updateActivePlanField = <K extends keyof DailyPlan>(field: K, value: DailyPlan[K]) => {
    const updatedPlan: DailyPlan = {
      ...currentPlan,
      [field]: value
    };
    savePlan(activeDateKey, updatedPlan);
  };

  // Global Habit Management
  const handleAddGlobalHabit = (name: string) => {
    const newHabit: HabitDefinition = {
      id: crypto.randomUUID(),
      name
    };
    const updated = [...habitDefinitions, newHabit];
    setHabitDefinitions(updated);
    localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(updated));
    showToast(`عادت جدید «${name}» با موفقیت افزوده شد.`);
  };

  const handleDeleteGlobalHabit = (id: string) => {
    const def = habitDefinitions.find(h => h.id === id);
    const updated = habitDefinitions.filter(h => h.id !== id);
    setHabitDefinitions(updated);
    localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(updated));
    if (def) {
      showToast(`عادت «${def.name}» حذف شد.`);
    }
  };

  const handleToggleHabitState = (habitId: string) => {
    const updatedHabits = currentPlan.habits.map(h => 
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    updateActivePlanField("habits", updatedHabits);
  };

  // Day Navigation
  const goToNextDay = () => {
    setDirection(1);
    const tomorrow = new Date(activeDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setActiveDate(tomorrow);
  };

  const goToPreviousDay = () => {
    setDirection(-1);
    const yesterday = new Date(activeDate);
    yesterday.setDate(yesterday.getDate() - 1);
    setActiveDate(yesterday);
  };

  const handleDateSelect = (date: Date) => {
    setDirection(date.getTime() > activeDate.getTime() ? 1 : -1);
    setActiveDate(date);
  };

  const resetToToday = () => {
    const today = new Date();
    setDirection(today.getTime() > activeDate.getTime() ? 1 : -1);
    setActiveDate(today);
  };

  // Plan Tomorrow promotion
  const handlePromoteTomorrow = () => {
    const draftText = currentPlan.planTomorrow;
    if (!draftText.trim()) return;

    const tomorrow = new Date(activeDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = toGregorianDateString(tomorrow);

    const tomorrowPlan = savedPlans[tomorrowKey] || {
      dateKey: tomorrowKey,
      priorities: [
        { text: "", completed: false },
        { text: "", completed: false },
        { text: "", completed: false }
      ],
      tasks: [],
      timeline: [],
      habits: habitDefinitions.map(h => ({ id: h.id, name: h.name, completed: false })),
      mood: "",
      energy: 0,
      notes: "",
      planTomorrow: "",
      reminders: []
    };

    const lines = draftText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newTasks: TaskItem[] = lines.map(line => {
      const cleanedText = line.replace(/^[\d۱۲۳۴۵۶۷۸۹۰\-*•\.\s]+/g, "").trim();
      return {
        id: crypto.randomUUID(),
        text: cleanedText || line,
        completed: false
      };
    });

    const updatedTomorrowPlan: DailyPlan = {
      ...tomorrowPlan,
      tasks: [...(tomorrowPlan.tasks || []), ...newTasks]
    };

    const updatedAllPlans = {
      ...savedPlans,
      [tomorrowKey]: updatedTomorrowPlan,
      [activeDateKey]: {
        ...currentPlan,
        planTomorrow: "" 
      }
    };

    setSavedPlans(updatedAllPlans);
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(updatedAllPlans));
    showToast(`${toPersianDigits(newTasks.length)} کار جدید به لیست کارهای فردا اضافه شد! 📋`);
  };

  // Yesterday's unfinished tasks check (rollover support)
  const yesterdayUnfinished = React.useMemo(() => {
    const yesterday = new Date(activeDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toGregorianDateString(yesterday);
    const yesterdayPlan = savedPlans[yesterdayKey];

    if (!yesterdayPlan) return [];

    const unfinished: string[] = [];
    yesterdayPlan.priorities?.forEach(p => {
      if (p.text.trim() && !p.completed) unfinished.push(p.text.trim());
    });
    yesterdayPlan.tasks?.forEach(t => {
      if (t.text.trim() && !t.completed) unfinished.push(t.text.trim());
    });

    return unfinished;
  }, [activeDate, savedPlans]);

  const handleCarryOverYesterday = () => {
    if (yesterdayUnfinished.length === 0) return;

    const newTasks: TaskItem[] = yesterdayUnfinished.map(text => ({
      id: crypto.randomUUID(),
      text,
      completed: false
    }));

    const updatedTasks = [...currentPlan.tasks, ...newTasks];

    // Bullet Journal: Mark yesterday's unfinished tasks as completed (migrated) to clear prompt
    const yesterday = new Date(activeDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toGregorianDateString(yesterday);
    const yesterdayPlan = savedPlans[yesterdayKey];

    const updatedAllPlans = { ...savedPlans };

    if (yesterdayPlan) {
      const updatedPriorities = yesterdayPlan.priorities?.map(p => ({ ...p, completed: true }));
      const updatedTasksList = yesterdayPlan.tasks?.map(t => ({ ...t, completed: true }));
      updatedAllPlans[yesterdayKey] = {
        ...yesterdayPlan,
        priorities: updatedPriorities,
        tasks: updatedTasksList
      };
    }

    updatedAllPlans[activeDateKey] = {
      ...currentPlan,
      tasks: updatedTasks
    };

    setSavedPlans(updatedAllPlans);
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(updatedAllPlans));
    showToast(`تعداد ${toPersianDigits(newTasks.length)} کار ناتمام از دیروز با موفقیت منتقل شدند. 🌱`);
  };

  // Save reflection
  const handleSaveReflection = (updated: any) => {
    if (activeReview?.type === "weekly") {
      const updatedList = { ...weeklyReflections, [activeReview.key]: updated };
      setWeeklyReflections(updatedList);
      localStorage.setItem(LOCAL_STORAGE_WEEKLY_KEY, JSON.stringify(updatedList));
      showToast("گزارش بازتاب هفتگی شما ثبت و ذخیره شد. 📔");
    } else if (activeReview?.type === "monthly") {
      const updatedList = { ...monthlyReflections, [activeReview.key]: updated };
      setMonthlyReflections(updatedList);
      localStorage.setItem(LOCAL_STORAGE_MONTHLY_KEY, JSON.stringify(updatedList));
      showToast("گزارش بازتاب ماهانه شما ثبت و ذخیره شد. 📔");
    }
  };

  // General Calendar Activity Map
  const activityMap = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number; hasNotes: boolean }> = {};
    
    Object.keys(savedPlans).forEach((key) => {
      const plan = savedPlans[key];
      let total = 0;
      let completed = 0;

      plan.priorities?.forEach((p) => {
        if (p.text.trim()) {
          total++;
          if (p.completed) completed++;
        }
      });

      plan.tasks?.forEach((t) => {
        total++;
        if (t.completed) completed++;
      });

      plan.timeline?.forEach((time) => {
        if (time.text.trim()) {
          total++;
          if (time.completed) completed++;
        }
      });

      const hasNotes = !!(plan.notes && plan.notes.trim());
      map[key] = { total, completed, hasNotes };
    });

    return map;
  }, [savedPlans]);

  // Day's progress summary
  const progressMetrics = React.useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    currentPlan.priorities.forEach(p => {
      if (p.text.trim()) {
        totalItems++;
        if (p.completed) completedItems++;
      }
    });

    currentPlan.tasks.forEach(t => {
      totalItems++;
      if (t.completed) completedItems++;
    });

    currentPlan.timeline.forEach(time => {
      if (time.text.trim()) {
        totalItems++;
        if (time.completed) completedItems++;
      }
    });

    currentPlan.habits.forEach(h => {
      totalItems++;
      if (h.completed) completedItems++;
    });

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    let feedback = "برگ جدیدی بگشایید و اهداف امروز خود را آرام بنویسید...";
    if (percent > 0 && percent <= 35) {
      feedback = "شروع فوق‌العاده‌ای است! به آرامی جلو بروید 🌱";
    } else if (percent > 35 && percent <= 75) {
      feedback = "عالی است، بیشتر از نیمی از اهداف را پوشش داده‌اید ☕";
    } else if (percent > 75 && percent < 100) {
      feedback = "در یک قدمی ثبت نهایی یک روز پربار هستید! ✨";
    } else if (percent === 100) {
      feedback = "یک روز شگفت‌انگیز را به پایان رساندید 🌟";
    }

    return { totalItems, completedItems, percent, feedback };
  }, [currentPlan]);

  // Ring Binder Generation
  const spiralRings = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center justify-between h-9 my-3 select-none">
        <div className="w-5 h-3.5 bg-gradient-to-r from-[#cbd5e1] via-[#fdfdfd] to-[#94a3b8] rounded-full shadow z-20 border border-[#b8c2cc]" />
        <div className="flex justify-between w-10 -mt-1.5 z-10">
          <div className="w-2.5 h-2.5 bg-[#45403a] rounded-full shadow-inner opacity-75" />
          <div className="w-2.5 h-2.5 bg-[#45403a] rounded-full shadow-inner opacity-75" />
        </div>
      </div>
    ));
  }, []);

  const pageTransitionVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -120 : 120,
      scale: 0.99
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 120 : -120,
      scale: 0.99,
      transition: { duration: 0.25, ease: "easeIn" }
    })
  };

  return (
    <div className="min-h-screen bg-[#f4efe9] text-[#292524] flex flex-col items-center justify-start py-4 px-3 sm:px-6 md:py-6 font-sans selection:bg-[#eae0d5]">
      
      {/* Top Banner Navigation */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 bg-[#fcfbf9] border border-[#eaddcf] p-4 rounded-2xl paper-shadow select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8c7851] text-white flex items-center justify-center paper-shadow">
            <BookOpen size={20} />
          </div>
          <div className="text-right">
            <h1 className="text-base font-bold text-[#44403c] tracking-tight">دفترچه برنامه‌ریزی آرامش</h1>
            <p className="text-[11px] text-[#8c7a5c]">یک ثبت با اصالت و الهام گرفته از صفحات کاغذی</p>
          </div>
        </div>

        {/* Action Shortcuts & Date Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Review Manual Links */}
          <button
            id="open-weekly-review"
            onClick={() => setActiveReview({ type: "weekly", key: getJalaliWeekKey(activeDate) })}
            className="px-3 py-1.5 rounded-xl border border-[#eaddcf] bg-white hover:bg-[#faf7f2] text-[#8c7851] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark size={12} className="fill-[#8c7851]/10" />
            <span>مرور هفته</span>
          </button>

          <button
            id="open-monthly-review"
            onClick={() => setActiveReview({ type: "monthly", key: getJalaliMonthKey(activeDate) })}
            className="px-3 py-1.5 rounded-xl border border-[#eaddcf] bg-white hover:bg-[#faf7f2] text-[#8c7851] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark size={12} className="fill-[#8c7851]/20" />
            <span>مرور ماه</span>
          </button>

          {/* Nav Controls */}
          <div className="flex items-center gap-1 bg-[#faf7f2] border border-[#eaddcf] p-1 rounded-xl">
            <button
              id="nav-prev"
              onClick={goToPreviousDay}
              className="p-1.5 rounded-lg hover:bg-white text-[#574f41] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            <div className="px-3 py-1 bg-white rounded-lg text-[#574f41] font-semibold text-xs flex items-center gap-1.5 shadow-sm border border-[#f0e4d7]">
              <CalendarIcon size={12} className="text-[#a89a7a]" />
              <span>{formatPersianDate(activeDate)}</span>
            </div>

            <button
              id="nav-today"
              onClick={resetToToday}
              className="px-2 py-1 rounded-lg text-[#8c7851] font-bold text-[10px] hover:bg-white transition-all cursor-pointer"
            >
              امروز
            </button>

            <button
              id="nav-next"
              onClick={goToNextDay}
              className="p-1.5 rounded-lg hover:bg-white text-[#574f41] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-Only Tabs Header */}
      <div className="w-full max-w-6xl md:hidden flex border-b border-[#eaddcf] mb-4 select-none">
        <button
          id="m-tab-planner"
          onClick={() => setMobileTab('planner')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold transition-all
            ${mobileTab === 'planner' 
              ? "text-[#8c7851] border-b-2 border-[#8c7851]" 
              : "text-[#8c7a5c]"
            }
          `}
        >
          اولویت و کارها
        </button>
        <button
          id="m-tab-notes"
          onClick={() => setMobileTab('notes_schedule')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold transition-all
            ${mobileTab === 'notes_schedule' 
              ? "text-[#8c7851] border-b-2 border-[#8c7851]" 
              : "text-[#8c7a5c]"
            }
          `}
        >
          زمان‌بندی و یادداشت
        </button>
        <button
          id="m-tab-calendar"
          onClick={() => setMobileTab('calendar_habits')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold transition-all
            ${mobileTab === 'calendar_habits' 
              ? "text-[#8c7851] border-b-2 border-[#8c7851]" 
              : "text-[#8c7a5c]"
            }
          `}
        >
          تقویم و ردیاب عادت
        </button>
      </div>

      {/* Main Open-Notebook Canvas Container */}
      <main className="w-full max-w-6xl flex-1 flex flex-col justify-stretch relative">
        
        {/* Double-Page Spread */}
        <div className="w-full grid grid-cols-1 md:grid-cols-21 gap-0 bg-[#e6ded5] rounded-3xl p-1 sm:p-2 md:p-3 shadow-xl border border-[#dbcfc2] min-h-[720px] relative">
          
          {/* LEFT PAGE - Priorities, Tasks, Reminders */}
          <div className={`md:col-span-10 flex flex-col bg-[#fcfbf9] rounded-2xl p-4 sm:p-6 left-page-curl border border-[#eaddcf] transition-all relative overflow-hidden
            ${mobileTab === 'planner' ? 'block' : 'hidden md:block'}
          `}>
            {/* Lined margins style decoration */}
            <div className="absolute right-10 top-0 bottom-0 w-[1px] border-r border-[#fca5a5] opacity-35 pointer-events-none" />

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeDateKey + "-left"}
                custom={direction}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5 flex-1 relative z-10 flex flex-col justify-start"
              >
                
                {/* Header Section with Progress summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f5ebe0] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#8c7851] select-none block tracking-wide">روزشمار برنامه</span>
                    <h2 className="text-lg font-bold text-[#44403c]">اهداف و اولویت‌ها</h2>
                  </div>

                  {/* Minimal circle progress */}
                  <div className="flex items-center gap-2 bg-[#faf7f2] border border-[#f2e7da] py-1.5 px-2.5 rounded-xl">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="16" cy="16" r="13" className="stroke-[#eae0d5]" strokeWidth="2.5" fill="transparent" />
                        <circle
                          cx="16"
                          cy="16"
                          r="13"
                          className="stroke-[#8c7851] transition-all duration-500"
                          strokeWidth="2.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 13}
                          strokeDashoffset={2 * Math.PI * 13 * (1 - progressMetrics.percent / 100)}
                        />
                      </svg>
                      <span className="absolute text-[9px] font-bold text-[#574f41]">
                        {toPersianDigits(progressMetrics.percent)}٪
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#574f41]">
                      {toPersianDigits(progressMetrics.completedItems)} از {toPersianDigits(progressMetrics.totalItems)} کار
                    </span>
                  </div>
                </div>

                {/* Motivational feedback line */}
                <p className="text-[11px] text-[#8c7a5c] italic border-r-2 border-[#8c7a5c] pr-2 select-none">
                  {progressMetrics.feedback}
                </p>

                {/* Yesterday's carry over suggestion banner */}
                {yesterdayUnfinished.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={14} className="text-amber-700 animate-pulse" />
                      <span className="text-xs text-amber-900 font-medium">
                        {toPersianDigits(yesterdayUnfinished.length)} کار ناتمام از دیروز باقی مانده است.
                      </span>
                    </div>
                    <button
                      id="carryover-yesterday-btn"
                      onClick={handleCarryOverYesterday}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors active:scale-95"
                    >
                      انتقال به امروز
                    </button>
                  </motion.div>
                )}

                {/* Mood & Energy */}
                <MoodAndEnergy 
                  mood={currentPlan.mood}
                  energy={currentPlan.energy}
                  onMoodChange={(m) => updateActivePlanField("mood", m)}
                  onEnergyChange={(e) => updateActivePlanField("energy", e)}
                />

                {/* Top 3 priorities */}
                <PrioritiesList 
                  priorities={currentPlan.priorities}
                  onChange={(p) => updateActivePlanField("priorities", p)}
                />

                {/* Checklist task list */}
                <TaskList 
                  tasks={currentPlan.tasks}
                  onChange={(t) => updateActivePlanField("tasks", t)}
                />

                {/* Reminders list */}
                <ReminderSystem 
                  reminders={currentPlan.reminders || []}
                  onChange={(r) => updateActivePlanField("reminders", r)}
                />

              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTRAL BINDER / SPIRAL WIRE */}
          <div className="hidden md:flex md:col-span-1 flex-col justify-center items-center z-20 pointer-events-none">
            {spiralRings}
          </div>

          {/* RIGHT PAGE - Calendar, Schedule, Notes, Habits, Tomorrow */}
          <div className={`md:col-span-10 flex flex-col bg-[#fcfbf9] rounded-2xl p-4 sm:p-6 right-page-curl border border-[#eaddcf] transition-all relative overflow-hidden
            ${mobileTab === 'notes_schedule' || mobileTab === 'calendar_habits' ? 'block' : 'hidden md:block'}
          `}>
            {/* Lined margins style decoration */}
            <div className="absolute left-10 top-0 bottom-0 w-[1px] border-l border-[#fca5a5] opacity-35 pointer-events-none" />

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeDateKey + "-right"}
                custom={direction}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-5 flex-1 relative z-10 flex flex-col justify-start"
              >
                
                {/* Right page sub-header */}
                <div className="flex items-center justify-between border-b border-[#f5ebe0] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#8c7851] select-none block tracking-wide">برنامه‌ریزی جزئیات</span>
                    <h2 className="text-lg font-bold text-[#44403c]">ثبت وقایع روزانه</h2>
                  </div>
                  
                  <span className="text-[10px] font-mono text-[#a89a7a] font-semibold bg-[#faf7f2] border border-[#eaddcf] px-2 py-0.5 rounded-lg">
                    {activeDateKey}
                  </span>
                </div>

                {/* If on Mobile Tab 'notes_schedule', show Schedule + Notes + Tomorrow */}
                {(!window.matchMedia("(max-width: 768px)").matches || mobileTab === 'notes_schedule') && (
                  <div className="space-y-5">
                    {/* Timeline Schedule */}
                    <TimelineSchedule 
                      timeline={currentPlan.timeline}
                      onChange={(tl) => updateActivePlanField("timeline", tl)}
                    />

                    {/* Rules Lined Pad Notes */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-[#c5a880]" />
                        <h3 className="text-xs font-semibold text-[#574f41]">یادداشت‌های آزاد روزانه</h3>
                      </div>

                      <div className="lined-paper relative rounded-2xl border border-[#eaddcf] bg-[#fdfdfc] p-3 min-h-[160px] shadow-inner">
                        <textarea
                          id="daily-notes-input"
                          value={currentPlan.notes}
                          onChange={(e) => updateActivePlanField("notes", e.target.value)}
                          placeholder="افکار، اتفاقات الهام‌بخش یا کارهای متفرقه خود را یادداشت کنید..."
                          className="w-full h-full bg-transparent border-none focus:outline-none text-xs text-[#44403c] placeholder-[#d0c6b8] resize-none"
                          style={{ lineHeight: "2.25rem", minHeight: "140px" }}
                        />
                      </div>
                    </div>

                    {/* Plan Tomorrow */}
                    <PlanTomorrow 
                      planText={currentPlan.planTomorrow}
                      onChange={(text) => updateActivePlanField("planTomorrow", text)}
                      onPromoteToTomorrow={handlePromoteTomorrow}
                    />
                  </div>
                )}

                {/* If on Mobile Tab 'calendar_habits', show Calendar + Habits */}
                {(!window.matchMedia("(max-width: 768px)").matches || mobileTab === 'calendar_habits') && (
                  <div className="space-y-5">
                    {/* Persian Calendar */}
                    <PersianCalendar 
                      activeDate={activeDate}
                      onDateChange={handleDateSelect}
                      activityMap={activityMap}
                    />

                    {/* Habit Tracker */}
                    <HabitTracker 
                      dayHabits={currentPlan.habits}
                      habitDefinitions={habitDefinitions}
                      onToggleHabit={handleToggleHabitState}
                      onAddGlobalHabit={handleAddGlobalHabit}
                      onDeleteGlobalHabit={handleDeleteGlobalHabit}
                    />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Floating Handwritten Sticky Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              id="sticky-toast-container"
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              exit={{ opacity: 0, y: -20, rotate: 2 }}
              className="fixed bottom-6 left-6 z-50 max-w-sm bg-amber-50 border border-amber-200 text-[#574f41] p-3 rounded-xl shadow-lg left-page-curl select-none"
            >
              <div className="flex items-start gap-2">
                <ClipboardCheck size={18} className="text-amber-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-bold text-amber-800">برگه یادداشت</h4>
                  <p className="text-[11px] text-[#6b6661] mt-0.5 leading-relaxed">{toastMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly & Monthly Review Overlay Modal */}
        <AnimatePresence>
          {activeReview && (
            <ReviewPages 
              type={activeReview.type}
              reviewKey={activeReview.key}
              savedPlans={savedPlans}
              reflection={activeReview.type === "weekly" ? (weeklyReflections[activeReview.key] || {
                weekKey: activeReview.key,
                whatWentWell: "",
                whatToImprove: "",
                mainFocusNextWeek: ""
              }) : (monthlyReflections[activeReview.key] || {
                monthKey: activeReview.key,
                whatWentWell: "",
                whatToImprove: "",
                mainFocusNextMonth: ""
              })}
              onSaveReflection={handleSaveReflection}
              onClose={() => setActiveReview(null)}
            />
          )}
        </AnimatePresence>

      </main>

      {/* Footer Design Credits */}
      <footer className="mt-6 text-center text-[11px] text-[#a89a7a] select-none">
        <p>دفترچه برنامه‌ریزی آرامش‌بخش • کارهای ناتمام به‌طور هوشمند منتقل می‌شوند.</p>
      </footer>

    </div>
  );
}
