import React from "react";
import { 
  formatPersianDate, 
  toGregorianDateString, 
  gregorianToJalali, 
  jalaliToGregorian,
  toPersianDigits 
} from "./utils/jalali";
import { DailyPlan, HabitDefinition, TaskItem, PriorityItem, TimelineItem } from "./types";
import { PersianCalendar } from "./components/PersianCalendar";
import { PrioritiesList } from "./components/PrioritiesList";
import { TaskList } from "./components/TaskList";
import { HabitTracker } from "./components/HabitTracker";
import { TimelineSchedule } from "./components/TimelineSchedule";
import { MoodAndEnergy } from "./components/MoodAndEnergy";
import { PlanTomorrow } from "./components/PlanTomorrow";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  RotateCcw, 
  ClipboardCheck, 
  FileText,
  Bookmark
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const LOCAL_STORAGE_PLANS_KEY = "persian_notebook_plans_v1";
const LOCAL_STORAGE_HABITS_KEY = "persian_notebook_habits_v1";

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
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<number>(0); // -1 for back, 1 for forward
  
  // Mobile active tab: 'planner' | 'calendar_habits'
  const [mobileTab, setMobileTab] = React.useState<'planner' | 'calendar_habits'>('planner');

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
    } catch (e) {
      console.error("Error loading local storage:", e);
      setHabitDefinitions(DEFAULT_HABITS);
    }
  }, []);

  // Save plans to local storage whenever they change
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
    }, 4000);
  };

  // Date Key for currently active day
  const activeDateKey = React.useMemo(() => {
    return toGregorianDateString(activeDate);
  }, [activeDate]);

  // Load / Initialize data for the active date
  const currentPlan = React.useMemo(() => {
    const plan = savedPlans[activeDateKey];
    
    // Ensure day's habits are in sync with global definitions
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
        habits: mergedHabits
      };
    }

    // Default template for a new blank day
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
      planTomorrow: ""
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

  // Global Habit Management (Updates Definitions & Synchronizes local day structure)
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

  // Navigating between days (with visual direction state for sliding transitions)
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

  // Plan Tomorrow Promotion Logic:
  // Converts drafted text lines in "Plan Tomorrow" into checklist tasks for the actual next day
  const handlePromoteTomorrow = () => {
    const draftText = currentPlan.planTomorrow;
    if (!draftText.trim()) return;

    // Tomorrow's date key
    const tomorrow = new Date(activeDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = toGregorianDateString(tomorrow);

    // Load or initialize tomorrow's plan
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
      planTomorrow: ""
    };

    // Split text into non-empty lines and convert to tasks
    const lines = draftText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newTasks: TaskItem[] = lines.map(line => {
      // Remove prefixes like "1.", "۱.", "-", "*", etc.
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

    // Save tomorrow's updated plan
    const updatedAllPlans = {
      ...savedPlans,
      [tomorrowKey]: updatedTomorrowPlan,
      [activeDateKey]: {
        ...currentPlan,
        planTomorrow: "" // Clear draft in current day
      }
    };

    setSavedPlans(updatedAllPlans);
    localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(updatedAllPlans));

    showToast(`${toPersianDigits(newTasks.length)} کار جدید به لیست کارهای فردا اضافه شد! 📋`);
  };

  // Activity map calculation for the Calendar Highlights
  const activityMap = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number; hasNotes: boolean }> = {};
    
    Object.keys(savedPlans).forEach((key) => {
      const plan = savedPlans[key];
      let total = 0;
      let completed = 0;

      // Count priorities
      plan.priorities?.forEach((p) => {
        if (p.text.trim()) {
          total++;
          if (p.completed) completed++;
        }
      });

      // Count tasks
      plan.tasks?.forEach((t) => {
        total++;
        if (t.completed) completed++;
      });

      // Count timeline tasks
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

  // Today's Progress summary calculations
  const progressMetrics = React.useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    // 1. Priorities
    currentPlan.priorities.forEach(p => {
      if (p.text.trim()) {
        totalItems++;
        if (p.completed) completedItems++;
      }
    });

    // 2. Tasks
    currentPlan.tasks.forEach(t => {
      totalItems++;
      if (t.completed) completedItems++;
    });

    // 3. Timeline Schedule
    currentPlan.timeline.forEach(time => {
      if (time.text.trim()) {
        totalItems++;
        if (time.completed) completedItems++;
      }
    });

    // 4. Habits
    currentPlan.habits.forEach(h => {
      totalItems++;
      if (h.completed) completedItems++;
    });

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Handwritten encouragement based on progress
    let feedback = "امروز یک برگ سفید است، آماده نوشتن...";
    if (percent > 0 && percent <= 30) {
      feedback = "شروع خوبی است! قدم به قدم جلو بروید 🌱";
    } else if (percent > 30 && percent <= 70) {
      feedback = "عالیه، تا اینجا نیمی از راه را پیموده‌اید! ☕";
    } else if (percent > 70 && percent < 100) {
      feedback = "بسیار عالی! فاصله‌ای تا پایان کارهای امروز نمانده است ✨";
    } else if (percent === 100) {
      feedback = "شگفت‌انگیز! تمام اهداف امروزتان را تیک زدید 🌟";
    }

    return { totalItems, completedItems, percent, feedback };
  }, [currentPlan]);

  // Center Spiral Rings generator
  const spiralRings = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center justify-between h-10 my-3 select-none">
        {/* Metal ring 3D style */}
        <div className="w-5 h-3.5 bg-gradient-to-r from-[#cbd5e1] via-[#f1f5f9] to-[#94a3b8] rounded-full shadow-md z-20 border border-[#b8c2cc]" />
        {/* Binder holes on both pages */}
        <div className="flex justify-between w-10 -mt-1.5 z-10">
          <div className="w-2.5 h-2.5 bg-[#45403a] rounded-full shadow-inner opacity-80" />
          <div className="w-2.5 h-2.5 bg-[#45403a] rounded-full shadow-inner opacity-80" />
        </div>
      </div>
    ));
  }, []);

  // Motion animation parameters for turning pages
  const pageTransitionVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -150 : 150,
      scale: 0.98
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 150 : -150,
      scale: 0.98,
      transition: { duration: 0.3, ease: "easeIn" }
    })
  };

  return (
    <div className="min-h-screen bg-[#f4efe9] text-[#292524] flex flex-col items-center justify-start py-4 px-3 sm:px-6 md:py-8 font-sans selection:bg-[#eae0d5]">
      
      {/* Top Banner Navigation */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 select-none bg-[#fcfbf9] border border-[#eaddcf] p-4 rounded-2xl paper-shadow">
        {/* App Title & Date Label */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8c7851] text-white flex items-center justify-center paper-shadow">
            <BookOpen size={20} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-[#44403c] tracking-tight">دفترچه برنامه‌ریزی روزانه</h1>
            <p className="text-xs text-[#8c7a5c]">یک ثبت خلوت و آرامش‌بخش برای هر روز</p>
          </div>
        </div>

        {/* Date Jump and General Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous Page */}
          <button
            id="nav-prev-day"
            onClick={goToPreviousDay}
            className="p-2 rounded-xl border border-[#eaddcf] bg-white hover:bg-[#faf7f2] text-[#574f41] transition-all cursor-pointer active:scale-95"
            title="روز قبل (برگ زدن به چپ)"
          >
            <ChevronRight size={18} />
          </button>

          {/* Date Label Button */}
          <div className="px-4 py-2 rounded-xl bg-[#f5ebe0] text-[#574f41] font-semibold text-sm flex items-center gap-2 border border-[#eaddcf]">
            <CalendarIcon size={14} className="text-[#a89a7a]" />
            <span>{formatPersianDate(activeDate)}</span>
          </div>

          {/* Today Button */}
          <button
            id="nav-today"
            onClick={resetToToday}
            className="px-3.5 py-2 rounded-xl border border-[#eaddcf] bg-white hover:bg-[#faf7f2] text-[#574f41] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw size={13} className="text-[#a89a7a]" />
            <span>امروز</span>
          </button>

          {/* Next Page */}
          <button
            id="nav-next-day"
            onClick={goToNextDay}
            className="p-2 rounded-xl border border-[#eaddcf] bg-white hover:bg-[#faf7f2] text-[#574f41] transition-all cursor-pointer active:scale-95"
            title="روز بعد (برگ زدن به راست)"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </header>

      {/* Mobile-Only Tabs Header */}
      <div className="w-full max-w-6xl md:hidden flex border-b border-[#eaddcf] mb-4 select-none">
        <button
          id="tab-planner"
          onClick={() => setMobileTab('planner')}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-all
            ${mobileTab === 'planner' 
              ? "text-[#8c7851] border-b-2 border-[#8c7851]" 
              : "text-[#8c7a5c] hover:text-[#574f41]"
            }
          `}
        >
          برنامه امروز
        </button>
        <button
          id="tab-calendar-habits"
          onClick={() => setMobileTab('calendar_habits')}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-all
            ${mobileTab === 'calendar_habits' 
              ? "text-[#8c7851] border-b-2 border-[#8c7851]" 
              : "text-[#8c7a5c] hover:text-[#574f41]"
            }
          `}
        >
          تقویم و عادت‌ها
        </button>
      </div>

      {/* Main Open-Notebook Canvas Container */}
      <main className="w-full max-w-6xl flex-1 flex flex-col justify-stretch relative">
        
        {/* Double-Page Spread */}
        <div className="w-full grid grid-cols-1 md:grid-cols-21 gap-0 bg-[#e6ded5] rounded-3xl p-1.5 sm:p-2.5 md:p-4 shadow-xl border border-[#dbcfc2] min-h-[720px] relative">
          
          {/* LEFT PAGE (Columns 1-10 on Desktop) */}
          <div className={`md:col-span-10 flex flex-col bg-[#fcfbf9] rounded-2xl p-4 sm:p-6 left-page-curl border border-[#eaddcf] transition-all relative overflow-hidden
            ${mobileTab === 'planner' ? 'block' : 'hidden md:block'}
          `}>
            
            {/* Lined margins style decoration (Vertical red margin lines on left page) */}
            <div className="absolute right-10 top-0 bottom-0 w-[1px] border-r border-[#fca5a5] opacity-50 pointer-events-none" />

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeDateKey + "-left"}
                custom={direction}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 flex-1 relative z-10"
              >
                
                {/* Header Section with Progress summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f5ebe0] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Bookmark size={15} className="text-[#8c7851]" />
                      <span className="text-xs font-bold text-[#8c7851] uppercase tracking-wider select-none">یادداشت‌های برنامه‌ریزی</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#44403c]">برنامهٔ من</h2>
                  </div>

                  {/* Circle progress gauge */}
                  <div className="flex items-center gap-3 bg-[#faf7f2] border border-[#f2e7da] py-2 px-3 rounded-xl">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      {/* Grey Circle Track */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          className="stroke-[#eae0d5]"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        {/* Golden/Brown Circle Filler */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          className="stroke-[#8c7851] transition-all duration-500 ease-out"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - progressMetrics.percent / 100)}
                        />
                      </svg>
                      {/* Percent Label */}
                      <span className="absolute text-[11px] font-bold text-[#574f41]">
                        {toPersianDigits(progressMetrics.percent)}٪
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-[#8c7a5c] font-semibold">میزان انجام امروز</span>
                      <span className="text-xs font-bold text-[#574f41] leading-none">
                        {toPersianDigits(progressMetrics.completedItems)} از {toPersianDigits(progressMetrics.totalItems)} کار
                      </span>
                    </div>
                  </div>
                </div>

                {/* Motivational feedback line */}
                <p className="text-xs font-medium text-[#8c7a5c] italic border-r-2 border-[#8c7a5c] pr-2 py-0.5 select-none">
                  {progressMetrics.feedback}
                </p>

                {/* Mood & Energy Indicator */}
                <MoodAndEnergy 
                  mood={currentPlan.mood}
                  energy={currentPlan.energy}
                  onMoodChange={(m) => updateActivePlanField("mood", m)}
                  onEnergyChange={(e) => updateActivePlanField("energy", e)}
                />

                {/* Priorities (Top 3 Tasks) */}
                <PrioritiesList 
                  priorities={currentPlan.priorities}
                  onChange={(p) => updateActivePlanField("priorities", p)}
                />

                {/* Todo Checklist */}
                <TaskList 
                  tasks={currentPlan.tasks}
                  onChange={(t) => updateActivePlanField("tasks", t)}
                />

              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTRAL BINDER / SPIRAL WIRE (Column 11 on Desktop) */}
          <div className="hidden md:flex md:col-span-1 flex-col justify-center items-center z-20 pointer-events-none">
            {spiralRings}
          </div>

          {/* RIGHT PAGE (Columns 12-21 on Desktop) */}
          <div className={`md:col-span-10 flex flex-col bg-[#fcfbf9] rounded-2xl p-4 sm:p-6 right-page-curl border border-[#eaddcf] transition-all relative overflow-hidden
            ${mobileTab === 'calendar_habits' ? 'block' : 'hidden md:block'}
          `}>
            
            {/* Lined margins style decoration (Vertical red margin lines on right page) */}
            <div className="absolute left-10 top-0 bottom-0 w-[1px] border-l border-[#fca5a5] opacity-50 pointer-events-none" />

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeDateKey + "-right"}
                custom={direction}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6 flex-1 relative z-10"
              >
                
                {/* Right page sub-header or Persian calendar toggle */}
                <div className="flex items-center justify-between border-b border-[#f5ebe0] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FileText size={15} className="text-[#8c7851]" />
                      <span className="text-xs font-bold text-[#8c7851] uppercase tracking-wider select-none">زمان‌بندی و یادداشت‌ها</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#44403c]">برنامه‌ریزی جزئیات</h2>
                  </div>
                  
                  <span className="text-xs font-mono text-[#a89a7a] font-semibold bg-[#faf7f2] border border-[#eaddcf] px-2.5 py-1 rounded-lg">
                    {activeDateKey}
                  </span>
                </div>

                {/* Calendar View (Small or Full Month) */}
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

                {/* Timeline Schedule */}
                <TimelineSchedule 
                  timeline={currentPlan.timeline}
                  onChange={(tl) => updateActivePlanField("timeline", tl)}
                />

                {/* Notebook Rules Freeform Notes Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#c5a880]" />
                    <h3 className="text-sm font-semibold text-[#574f41]">یادداشت‌های آزاد روزانه</h3>
                  </div>

                  {/* Lined-paper block mimicking a physical lined pad */}
                  <div className="lined-paper relative rounded-2xl border border-[#eaddcf] bg-[#fdfdfc] p-4 min-h-[180px] shadow-inner">
                    <textarea
                      id="daily-notes-textarea"
                      value={currentPlan.notes}
                      onChange={(e) => updateActivePlanField("notes", e.target.value)}
                      placeholder="اینجا بنویسید... (خطوط یادداشت‌ها به‌طور طبیعی مثل یک دفترچه واقعی تنظیم شده‌اند)"
                      className="w-full h-full bg-transparent border-none focus:outline-none text-sm text-[#44403c] placeholder-[#d0c6b8] resize-none"
                      style={{ lineHeight: "2.25rem", minHeight: "150px" }}
                    />
                  </div>
                </div>

                {/* Plan Tomorrow Section */}
                <PlanTomorrow 
                  planText={currentPlan.planTomorrow}
                  onChange={(text) => updateActivePlanField("planTomorrow", text)}
                  onPromoteToTomorrow={handlePromoteTomorrow}
                />

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Floating Handwritten Sticky Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              id="sticky-toast"
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              exit={{ opacity: 0, y: -20, rotate: 2 }}
              className="absolute bottom-6 left-6 z-50 max-w-sm bg-amber-50 border border-amber-200 text-[#574f41] p-4 rounded-xl shadow-lg left-page-curl select-none"
            >
              <div className="flex items-start gap-2.5">
                <ClipboardCheck size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800">یادداشت دفترچه</h4>
                  <p className="text-xs text-[#6b6661] mt-1 leading-relaxed">{toastMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer Design Credits */}
      <footer className="mt-8 text-center text-xs text-[#a89a7a] select-none">
        <p>دفترچه برنامه‌ریزی روزانه مینیمال • تمامی اطلاعات محلی ذخیره می‌شوند.</p>
      </footer>

    </div>
  );
}
