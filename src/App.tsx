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
  TimelineItem,
  WeeklyPlan,
  WeeklyReflection, 
  MonthlyReflection,
  ReminderItem
} from "./types";
import { PersianCalendar } from "./components/PersianCalendar";
import { PrioritiesList } from "./components/PrioritiesList";
import { UnifiedTaskList } from "./components/UnifiedTaskList";
import { HabitTracker } from "./components/HabitTracker";
import { MoodAndEnergy } from "./components/MoodAndEnergy";
import { PlanTomorrow } from "./components/PlanTomorrow";
import { ReminderSystem } from "./components/ReminderSystem";
import { ReviewPages } from "./components/ReviewPages";
import { WeeklyPlanner } from "./components/WeeklyPlanner";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  FileText,
  Bookmark,
  Sparkles,
  ArrowRightLeft,
  LayoutGrid,
  Sun,
  Moon,
  Pencil
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const LOCAL_STORAGE_PLANS_KEY = "persian_notebook_plans_v1";
const LOCAL_STORAGE_HABITS_KEY = "persian_notebook_habits_v1";
const LOCAL_STORAGE_WEEKLY_REFLECTIONS_KEY = "persian_notebook_weekly_v1";
const LOCAL_STORAGE_MONTHLY_REFLECTIONS_KEY = "persian_notebook_monthly_v1";
const LOCAL_STORAGE_WEEKLY_PLANS_KEY = "persian_notebook_weekly_plans_v1";
const LOCAL_STORAGE_THEME_KEY = "persian_notebook_theme_v1";

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
  const [weeklyPlans, setWeeklyPlans] = React.useState<Record<string, WeeklyPlan>>({});
  const [weeklyReflections, setWeeklyReflections] = React.useState<Record<string, WeeklyReflection>>({});
  const [monthlyReflections, setMonthlyReflections] = React.useState<Record<string, MonthlyReflection>>({});
  const [themeMode, setThemeMode] = React.useState<"light" | "dark">("light");
  
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<number>(0); 
  
  // Mobile active tab: 'planner' | 'notes_schedule' | 'calendar_habits'
  const [mobileTab, setMobileTab] = React.useState<'planner' | 'notes_schedule' | 'calendar_habits'>('planner');

  // Modal triggers
  const [showWeeklyPlanner, setShowWeeklyPlanner] = React.useState<boolean>(false);
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

      const storedWeeklyPlans = localStorage.getItem(LOCAL_STORAGE_WEEKLY_PLANS_KEY);
      if (storedWeeklyPlans) {
        setWeeklyPlans(JSON.parse(storedWeeklyPlans));
      }

      const storedWeekly = localStorage.getItem(LOCAL_STORAGE_WEEKLY_REFLECTIONS_KEY);
      if (storedWeekly) {
        setWeeklyReflections(JSON.parse(storedWeekly));
      }

      const storedMonthly = localStorage.getItem(LOCAL_STORAGE_MONTHLY_REFLECTIONS_KEY);
      if (storedMonthly) {
        setMonthlyReflections(JSON.parse(storedMonthly));
      }

      const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeMode(storedTheme);
      }
    } catch (e) {
      console.error("Error loading local storage:", e);
      setHabitDefinitions(DEFAULT_HABITS);
    }
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, nextTheme);
  };

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

  // Handle Unified Task updates (tasks & timeline together)
  const handleUnifiedTaskChange = (updatedTasks: TaskItem[], updatedTimeline: TimelineItem[]) => {
    const updatedPlan: DailyPlan = {
      ...currentPlan,
      tasks: updatedTasks,
      timeline: updatedTimeline
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
    showToast(`عادت جدید «${name}» اضافه شد.`);
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
    showToast(`${toPersianDigits(newTasks.length)} کار جدید به برنامه‌های فردا اضافه شد.`);
  };

  // Unfinished tasks rollover
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
    showToast(`تعداد ${toPersianDigits(newTasks.length)} کار ناتمام از دیروز منتقل گردید.`);
  };

  // Save reflection
  const handleSaveReflection = (updated: any) => {
    if (activeReview?.type === "weekly") {
      const updatedList = { ...weeklyReflections, [activeReview.key]: updated };
      setWeeklyReflections(updatedList);
      localStorage.setItem(LOCAL_STORAGE_WEEKLY_REFLECTIONS_KEY, JSON.stringify(updatedList));
      showToast("گزارش بازتاب هفتگی ثبت شد.");
    } else if (activeReview?.type === "monthly") {
      const updatedList = { ...monthlyReflections, [activeReview.key]: updated };
      setMonthlyReflections(updatedList);
      localStorage.setItem(LOCAL_STORAGE_MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedList));
      showToast("گزارش بازتاب ماهانه ثبت شد.");
    }
  };

  // Save Weekly Plan
  const handleSaveWeeklyPlan = (weekKey: string, updatedWeeklyPlan: WeeklyPlan) => {
    const updatedMap = {
      ...weeklyPlans,
      [weekKey]: updatedWeeklyPlan
    };
    setWeeklyPlans(updatedMap);
    localStorage.setItem(LOCAL_STORAGE_WEEKLY_PLANS_KEY, JSON.stringify(updatedMap));
  };

  // Sync Weekly Plan item to Daily Plan
  const handleSyncDailyPlan = (dateKey: string, updatedPlan: DailyPlan) => {
    savePlan(dateKey, updatedPlan);
  };

  // Calendar Activity Map
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

  // Day progress summary
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

    let feedback = "صفحه امروز آماده است. اهداف آرام خود را بنویسید...";
    if (percent > 0 && percent <= 35) {
      feedback = "شروع بسیار خوبی است! به آرامی جلو بروید 🌱";
    } else if (percent > 35 && percent <= 75) {
      feedback = "بیشتر از نیمی از برنامه‌ها محقق گردید ☕";
    } else if (percent > 75 && percent < 100) {
      feedback = "در یک قدمی ثبت یک روز کامل هستید! ✨";
    } else if (percent === 100) {
      feedback = "یک روز کامل و آرام به پایان رسید 🌟";
    }

    return { totalItems, completedItems, percent, feedback };
  }, [currentPlan]);

  // Ring Binder
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
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 120 : -120,
      scale: 0.99,
      transition: { duration: 0.25, ease: "easeIn" }
    })
  };

  // Theme-dependent container styling
  const isDark = themeMode === "dark";
  const bgMain = isDark ? "bg-[#0b130e] text-[#f0f7f2]" : "bg-[#f2f6f3] text-[#1a231e]";
  const headerBg = isDark ? "bg-[#15231b] border-[#293d30]" : "bg-white border-[#d2e0d5]";
  const pageBg = isDark ? "bg-[#15231b] border-[#293d30]" : "bg-white border-[#d2e0d5]";
  const spreadCoverBg = isDark ? "bg-[#0f1913] border-[#203227]" : "bg-[#dbe7de] border-[#c7dacd]";

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col items-center justify-start py-4 px-3 sm:px-6 md:py-6 font-sans selection:bg-[#2e4f40]/20 transition-colors duration-300`}>
      
      {/* Top Banner Navigation */}
      <header className={`w-full max-w-6xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-5 ${headerBg} p-4 sm:p-4.5 rounded-2xl paper-shadow select-none border transition-colors`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#2e4f40] dark:bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="text-right">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#1a231e] dark:text-[#f0f7f2]">دفترچه برنامه‌ریزی آرامش</h1>
            <p className="text-[11px] sm:text-xs font-medium text-[#526357] dark:text-[#a8c2b2]">طراحی کاغذی، مینیمال و کاربرپسند</p>
          </div>
        </div>

        {/* Action Shortcuts & Date Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          
          {/* Main 3 Navigation Buttons Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto flex-1">
            {/* Weekly Planner Trigger */}
            <button
              id="open-weekly-planner"
              onClick={() => setShowWeeklyPlanner(true)}
              className="px-1.5 sm:px-3.5 py-2 min-h-[44px] rounded-xl bg-[#2e4f40] dark:bg-emerald-600 hover:bg-[#233f33] dark:hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs active:scale-95 text-center leading-tight"
            >
              <LayoutGrid size={14} className="flex-shrink-0" />
              <span>برنامه‌ریزی هفتگی</span>
            </button>

            {/* Weekly Review */}
            <button
              id="open-weekly-review"
              onClick={() => setActiveReview({ type: "weekly", key: getJalaliWeekKey(activeDate) })}
              className="px-1.5 sm:px-3.5 py-2 min-h-[44px] rounded-xl border border-[#d2e0d5] dark:border-[#2f4335] bg-[#f8faf8] dark:bg-[#1a2920] text-[#2e4f40] dark:text-[#aee2c2] font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-[#eaf0ec] dark:hover:bg-[#24372b] shadow-2xs active:scale-95 text-center leading-tight"
            >
              <Bookmark size={13} className="fill-[#2e4f40]/30 dark:fill-emerald-400/30 flex-shrink-0" />
              <span>مرور هفته</span>
            </button>

            {/* Monthly Review */}
            <button
              id="open-monthly-review"
              onClick={() => setActiveReview({ type: "monthly", key: getJalaliMonthKey(activeDate) })}
              className="px-1.5 sm:px-3.5 py-2 min-h-[44px] rounded-xl border border-[#d2e0d5] dark:border-[#2f4335] bg-[#f8faf8] dark:bg-[#1a2920] text-[#2e4f40] dark:text-[#aee2c2] font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-[#eaf0ec] dark:hover:bg-[#24372b] shadow-2xs active:scale-95 text-center leading-tight"
            >
              <Bookmark size={13} className="fill-[#2e4f40]/50 dark:fill-emerald-400/50 flex-shrink-0" />
              <span>مرور ماه</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl border border-[#d2e0d5] dark:border-[#2f4335] bg-[#f8faf8] dark:bg-[#1a2920] text-[#1a231e] dark:text-[#eef4f0] hover:bg-[#eaf0ec] dark:hover:bg-[#24372b] cursor-pointer transition-all shadow-2xs flex items-center justify-center"
              title={isDark ? "تغییر به پوسته کاغذ کاهی روشن" : "تغییر به پوسته تیره سرسبز"}
            >
              {isDark ? <Sun size={18} className="text-emerald-400" /> : <Moon size={18} className="text-[#2e4f40]" />}
            </button>

            {/* Day Nav Controls */}
            <div className="flex items-center gap-1 bg-[#eaf0ec] dark:bg-[#121d16] border border-[#d2e0d5] dark:border-[#2f4335] p-1 rounded-xl text-[#1a231e] dark:text-[#eef4f0] min-h-[44px]">
              <button
                id="nav-prev"
                onClick={goToPreviousDay}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-[#24372b] transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center text-[#526357] dark:text-[#c2dacb] hover:text-[#1a231e] dark:hover:text-white"
                title="روز قبل"
              >
                <ChevronRight size={17} />
              </button>

              <div className="px-3 py-1 bg-white dark:bg-[#24372b] rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs border border-[#d2e0d5] dark:border-[#384c3f] text-[#1a231e] dark:text-[#f0f7f2] whitespace-nowrap">
                <CalendarIcon size={14} className="text-[#2e4f40] dark:text-emerald-400" />
                <span>{formatPersianDate(activeDate)}</span>
              </div>

              <button
                id="nav-today"
                onClick={resetToToday}
                className="px-2.5 py-1 rounded-lg text-[#2e4f40] dark:text-[#aee2c2] font-extrabold text-[11px] hover:bg-white dark:hover:bg-[#24372b] transition-all cursor-pointer whitespace-nowrap"
              >
                امروز
              </button>

              <button
                id="nav-next"
                onClick={goToNextDay}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-[#24372b] transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center text-[#526357] dark:text-[#c2dacb] hover:text-[#1a231e] dark:hover:text-white"
                title="روز بعد"
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-Only Tabs Header */}
      <div className="w-full max-w-6xl md:hidden flex border-b border-[#d2e0d5] dark:border-[#2f4335] mb-4 select-none bg-white dark:bg-[#15231b] rounded-xl p-1 shadow-2xs gap-1">
        <button
          id="m-tab-planner"
          onClick={() => setMobileTab('planner')}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition-all min-h-[44px] rounded-lg cursor-pointer flex items-center justify-center
            ${mobileTab === 'planner' 
              ? "bg-[#2e4f40] dark:bg-emerald-600 text-white shadow-2xs" 
              : "text-[#526357] dark:text-[#a8c2b2] hover:bg-[#eaf0ec] dark:hover:bg-[#1a2920]"
            }
          `}
        >
          اولویت و کارها
        </button>
        <button
          id="m-tab-notes"
          onClick={() => setMobileTab('notes_schedule')}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition-all min-h-[44px] rounded-lg cursor-pointer flex items-center justify-center
            ${mobileTab === 'notes_schedule' 
              ? "bg-[#2e4f40] dark:bg-emerald-600 text-white shadow-2xs" 
              : "text-[#526357] dark:text-[#a8c2b2] hover:bg-[#eaf0ec] dark:hover:bg-[#1a2920]"
            }
          `}
        >
          یادداشت و تقویم
        </button>
        <button
          id="m-tab-calendar"
          onClick={() => setMobileTab('calendar_habits')}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition-all min-h-[44px] rounded-lg cursor-pointer flex items-center justify-center
            ${mobileTab === 'calendar_habits' 
              ? "bg-[#2e4f40] dark:bg-emerald-600 text-white shadow-2xs" 
              : "text-[#526357] dark:text-[#a8c2b2] hover:bg-[#eaf0ec] dark:hover:bg-[#1a2920]"
            }
          `}
        >
          عادت‌ها و یادآوری
        </button>
      </div>

      {/* Main Open-Notebook Canvas Container */}
      <main className="w-full max-w-6xl flex-1 flex flex-col justify-stretch relative">
        
        {/* Double-Page Spread */}
        <div className={`w-full grid grid-cols-1 md:grid-cols-21 gap-0 ${spreadCoverBg} rounded-3xl p-1.5 sm:p-2.5 md:p-3.5 shadow-xl min-h-[720px] relative transition-colors`}>
          
          {/* LEFT PAGE - Priorities, Unified Tasks, Reminders */}
          <div className={`md:col-span-10 flex flex-col ${pageBg} rounded-2xl p-4 sm:p-6 left-page-curl transition-all relative overflow-hidden border
            ${mobileTab === 'planner' ? 'block' : 'hidden md:block'}
          `}>
            {/* Lined margins style decoration */}
            <div className="absolute right-10 top-0 bottom-0 w-[1px] border-r border-emerald-300 opacity-25 pointer-events-none" />

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeDateKey + "-left"}
                custom={direction}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4 flex-1 relative z-10 flex flex-col justify-start"
              >
                
                {/* Header Section with Progress summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#2e4f40] dark:text-[#a8c2b2] select-none block tracking-wide">روزشمار برنامه</span>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#1a231e] dark:text-[#eef4f0]">اهداف و اولویت‌ها</h2>
                  </div>

                  {/* Minimal circle progress */}
                  <div className="flex items-center gap-2 bg-[#f8faf8] dark:bg-[#19241e] border border-[#d2e0d5] dark:border-[#2d3e33] py-1.5 px-3 rounded-xl shadow-2xs">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="16" cy="16" r="13" className="stroke-[#d2e0d5] dark:stroke-[#2d3e33]" strokeWidth="2.5" fill="transparent" />
                        <circle
                          cx="16"
                          cy="16"
                          r="13"
                          className="stroke-[#2e4f40] dark:stroke-[#a8c2b2] transition-all duration-500"
                          strokeWidth="2.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 13}
                          strokeDashoffset={2 * Math.PI * 13 * (1 - progressMetrics.percent / 100)}
                        />
                      </svg>
                      <span className="absolute text-[9px] font-extrabold text-[#1a231e] dark:text-[#eef4f0]">
                        {toPersianDigits(progressMetrics.percent)}٪
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#2e4f40] dark:text-[#a8c2b2]">
                      {toPersianDigits(progressMetrics.completedItems)} از {toPersianDigits(progressMetrics.totalItems)} کار
                    </span>
                  </div>
                </div>

                {/* Motivational feedback line */}
                <p className="text-[11px] text-[#526357] dark:text-[#9db0a3] font-medium italic border-r-2 border-[#2e4f40] pr-2.5 select-none">
                  {progressMetrics.feedback}
                </p>

                {/* Yesterday's carry over suggestion banner */}
                {yesterdayUnfinished.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-[#eaf0ec]/90 border border-[#cfdcd3] rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={14} className="text-[#2e4f40] animate-pulse flex-shrink-0" />
                      <span className="text-xs text-[#1a231e] font-bold">
                        {toPersianDigits(yesterdayUnfinished.length)} کار ناتمام از دیروز باقی مانده است.
                      </span>
                    </div>
                    <button
                      id="carryover-yesterday-btn"
                      onClick={handleCarryOverYesterday}
                      className="px-3 py-1.5 bg-[#2e4f40] hover:bg-[#233f33] text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 min-h-[36px] shadow-2xs"
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

                {/* Unified Tasks List (Scheduled & Unscheduled) */}
                <UnifiedTaskList 
                  tasks={currentPlan.tasks}
                  timeline={currentPlan.timeline}
                  onChange={handleUnifiedTaskChange}
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

          {/* RIGHT PAGE - Calendar, Notes, Habits, Tomorrow */}
          <div className={`md:col-span-10 flex flex-col ${pageBg} rounded-2xl p-4 sm:p-6 right-page-curl transition-all relative overflow-hidden border
            ${mobileTab === 'notes_schedule' || mobileTab === 'calendar_habits' ? 'block' : 'hidden md:block'}
          `}>
            {/* Lined margins style decoration */}
            <div className="absolute left-10 top-0 bottom-0 w-[1px] border-l border-emerald-300 opacity-25 pointer-events-none" />

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeDateKey + "-right"}
                custom={direction}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4 flex-1 relative z-10 flex flex-col justify-start"
              >
                
                {/* Right page sub-header */}
                <div className="flex items-center justify-between border-b border-[#e2ece4] dark:border-[#2d3e33] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#2e4f40] dark:text-[#a8c2b2] select-none block tracking-wide">برنامه‌ریزی جزئیات</span>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#1a231e] dark:text-[#eef4f0]">ثبت وقایع و تقویم</h2>
                  </div>
                  
                  <span className="text-[10px] font-mono font-bold bg-[#eaf0ec] dark:bg-[#19241e] border border-[#cfdcd3] dark:border-[#2d3e33] px-2.5 py-1 rounded-lg text-[#2e4f40] dark:text-[#a8c2b2]">
                    {activeDateKey}
                  </span>
                </div>

                {/* If on Mobile Tab 'notes_schedule', show Notes + Tomorrow */}
                {(!window.matchMedia("(max-width: 768px)").matches || mobileTab === 'notes_schedule') && (
                  <div className="space-y-4">
                    
                    {/* Rules Lined Pad Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-[#eaf0ec] text-[#2e4f40] border border-[#cfdcd3]">
                            <FileText size={15} />
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-[#1a231e] dark:text-[#eef4f0]">یادداشت‌های آزاد روزانه</h3>
                        </div>
                        <Pencil size={13} className="text-[#2e4f40]" />
                      </div>

                      <div className="lined-paper relative rounded-2xl border border-[#d2e0d5] dark:border-[#2d3e33] bg-[#f8faf8] dark:bg-[#19241e] p-3.5 shadow-2xs">
                        <textarea
                          id="daily-notes-input"
                          value={currentPlan.notes}
                          onChange={(e) => updateActivePlanField("notes", e.target.value)}
                          placeholder="افکار، اتفاقات الهام‌بخش یا کارهای متفرقه خود را بنویسید..."
                          className="w-full h-full bg-transparent border-none focus:outline-none text-xs sm:text-sm text-[#1a231e] dark:text-[#eef4f0] placeholder-[#829487] font-medium resize-none"
                          style={{ lineHeight: "2.25rem", minHeight: "150px" }}
                        />
                      </div>
                    </div>

                    {/* Plan Tomorrow */}
                    <PlanTomorrow 
                      planText={currentPlan.planTomorrow}
                      onChange={(text) => updateActivePlanField("planTomorrow", text)}
                      onPromoteToTomorrow={handlePromoteTomorrow}
                    />

                    {/* Persian Calendar */}
                    <PersianCalendar 
                      activeDate={activeDate}
                      onDateChange={handleDateSelect}
                      activityMap={activityMap}
                    />
                  </div>
                )}

                {/* If on Mobile Tab 'calendar_habits', show Habits + Calendar */}
                {(!window.matchMedia("(max-width: 768px)").matches || mobileTab === 'calendar_habits') && (
                  <div className="space-y-4">
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

        {/* Sticky Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              id="sticky-toast-container"
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              exit={{ opacity: 0, y: -20, rotate: 2 }}
              className="fixed bottom-6 left-6 z-50 max-w-sm bg-[#eaf0ec] border border-[#cfdcd3] text-[#1a231e] p-3 rounded-xl shadow-lg left-page-curl select-none"
            >
              <div className="flex items-start gap-2">
                <ClipboardCheck size={18} className="text-[#2e4f40] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-bold text-[#2e4f40]">دفترچه برنامه‌ریزی</h4>
                  <p className="text-[11px] text-[#526357] mt-0.5 leading-relaxed">{toastMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dedicated Weekly Planning Modal */}
        <AnimatePresence>
          {showWeeklyPlanner && (
            <WeeklyPlanner 
              currentDate={activeDate}
              savedPlans={savedPlans}
              weeklyPlans={weeklyPlans}
              onSaveWeeklyPlan={handleSaveWeeklyPlan}
              onSyncDailyPlan={handleSyncDailyPlan}
              onClose={() => setShowWeeklyPlanner(false)}
            />
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
                biggestAchievement: "",
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
      <footer className="mt-6 text-center text-[11px] opacity-75 select-none text-[#526357] dark:text-[#b0d2bc]">
        <p>دفترچه برنامه‌ریزی آرامش‌بخش • کارهای ناتمام به‌طور هوشمند منتقل می‌شوند.</p>
      </footer>

    </div>
  );
}
