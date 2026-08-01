import React from "react";
import { 
  gregorianToJalali, 
  jalaliToGregorian, 
  getDaysInJalaliMonth, 
  getPersianWeekdayIndex, 
  JALALI_MONTH_NAMES, 
  PERSIAN_WEEKDAYS, 
  toPersianDigits,
  toGregorianDateString
} from "../utils/jalali";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";

interface PersianCalendarProps {
  activeDate: Date;
  onDateChange: (date: Date) => void;
  // A map of "YYYY-MM-DD" -> true (to show if a day has any tasks or entries saved)
  activityMap: Record<string, { total: number; completed: number; hasNotes: boolean }>;
}

export const PersianCalendar: React.FC<PersianCalendarProps> = ({
  activeDate,
  onDateChange,
  activityMap
}) => {
  // Convert current active date to Jalali to know the current viewing year/month
  const activeJalali = gregorianToJalali(activeDate);
  
  // We keep a local state of what month/year the calendar is CURRENTLY viewing
  const [viewJalali, setViewJalali] = React.useState({
    jy: activeJalali.jy,
    jm: activeJalali.jm
  });

  // Sync viewing month/year when active date changes from outside
  React.useEffect(() => {
    const updated = gregorianToJalali(activeDate);
    setViewJalali({ jy: updated.jy, jm: updated.jm });
  }, [activeDate]);

  // Handle month navigation
  const nextMonth = () => {
    if (viewJalali.jm === 12) {
      setViewJalali({ jy: viewJalali.jy + 1, jm: 1 });
    } else {
      setViewJalali({ ...viewJalali, jm: viewJalali.jm + 1 });
    }
  };

  const prevMonth = () => {
    if (viewJalali.jm === 1) {
      setViewJalali({ jy: viewJalali.jy - 1, jm: 12 });
    } else {
      setViewJalali({ ...viewJalali, jm: viewJalali.jm - 1 });
    }
  };

  // Generate calendar days
  const totalDays = getDaysInJalaliMonth(viewJalali.jy, viewJalali.jm);
  
  // Find the weekday index of the 1st day of this Jalali month
  const firstDayDate = jalaliToGregorian(viewJalali.jy, viewJalali.jm, 1);
  const firstDayWeekdayIndex = getPersianWeekdayIndex(firstDayDate); // 0 (شنبه) to 6 (جمعه)

  // Today's Date in Jalali
  const todayDate = new Date();
  const todayJalali = gregorianToJalali(todayDate);

  const days: React.ReactNode[] = [];

  // Fill in empty spaces for the days of the previous week
  for (let i = 0; i < firstDayWeekdayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  }

  // Fill in the month's days
  for (let d = 1; d <= totalDays; d++) {
    const currentGregorianDate = jalaliToGregorian(viewJalali.jy, viewJalali.jm, d);
    const dateStr = toGregorianDateString(currentGregorianDate);
    
    const isActive = 
      activeJalali.jy === viewJalali.jy && 
      activeJalali.jm === viewJalali.jm && 
      activeJalali.jd === d;
      
    const isToday = 
      todayJalali.jy === viewJalali.jy && 
      todayJalali.jm === viewJalali.jm && 
      todayJalali.jd === d;

    // Retrieve activity summary for this day
    const activity = activityMap[dateStr];
    const hasActivity = activity && (activity.total > 0 || activity.hasNotes);
    const allDone = activity && activity.total > 0 && activity.completed === activity.total;

    days.push(
      <button
        key={`day-${d}`}
        id={`calendar-day-${viewJalali.jy}-${viewJalali.jm}-${d}`}
        onClick={() => onDateChange(currentGregorianDate)}
        className={`relative h-9 w-9 flex items-center justify-center text-xs sm:text-sm rounded-xl transition-all duration-200 cursor-pointer focus:outline-none group font-medium
          ${isActive 
            ? "bg-[#2e4f40] dark:bg-emerald-600 text-white font-bold paper-shadow scale-105 shadow-xs" 
            : isToday 
              ? "border-2 border-[#2e4f40] dark:border-emerald-400 text-[#2e4f40] dark:text-emerald-300 bg-[#eaf0ec]/80 dark:bg-[#25362c] font-bold" 
              : "text-[#1a231e] dark:text-[#f0f7f2] hover:bg-[#eaf0ec]/60 dark:hover:bg-[#25362c] hover:text-[#2e4f40] dark:hover:text-emerald-300"
          }
        `}
      >
        <span>{toPersianDigits(d)}</span>
        
        {/* Activity Indicator Dots */}
        {hasActivity && !isActive && (
          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${allDone ? 'bg-emerald-600 dark:bg-emerald-400 ring-1 ring-emerald-200' : 'bg-[#2e4f40] dark:bg-emerald-300'}`} />
        )}
      </button>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#1f2c25] border border-[#d2e0d5] dark:border-[#2d3e33] rounded-2xl p-4 sm:p-5 paper-shadow font-sans">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3.5 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-2.5">
        <button
          id="btn-next-month"
          onClick={nextMonth}
          className="p-1.5 rounded-xl hover:bg-[#eaf0ec] dark:hover:bg-[#27382e] text-[#2e4f40] dark:text-[#aee2c2] cursor-pointer transition-all active:scale-95 border border-transparent hover:border-[#cfdcd3] dark:hover:border-[#34483b]"
          title="ماه بعد"
        >
          <ChevronRight size={18} />
        </button>

        <div className="flex items-center gap-2 text-[#1a231e] dark:text-[#f0f7f2] font-bold text-sm sm:text-base select-none">
          <div className="p-1.5 rounded-lg bg-[#eaf0ec] dark:bg-[#141d18] text-[#2e4f40] dark:text-emerald-400 border border-[#cfdcd3] dark:border-[#2d3e33]">
            <CalendarIcon size={15} />
          </div>
          <span>{JALALI_MONTH_NAMES[viewJalali.jm - 1]}</span>
          <span>{toPersianDigits(viewJalali.jy)}</span>
        </div>

        <button
          id="btn-prev-month"
          onClick={prevMonth}
          className="p-1.5 rounded-xl hover:bg-[#eaf0ec] dark:hover:bg-[#27382e] text-[#2e4f40] dark:text-[#aee2c2] cursor-pointer transition-all active:scale-95 border border-transparent hover:border-[#cfdcd3] dark:hover:border-[#34483b]"
          title="ماه قبل"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Weekdays Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#526357] dark:text-[#b0d2bc] mb-2 border-b border-[#e2ece4] dark:border-[#2d3e33] pb-1.5">
        {PERSIAN_WEEKDAYS.map((day, idx) => (
          <div key={idx} className="h-6 flex items-center justify-center">
            {day.substring(0, 2)}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
        {days}
      </div>

      {/* Quick Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#e2ece4] dark:border-[#2d3e33] text-[11px] text-[#526357] dark:text-[#b0d2bc] font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2e4f40] dark:border-emerald-400 bg-[#eaf0ec] dark:bg-[#25362c]" />
          <span>امروز</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2e4f40] dark:bg-emerald-400" />
          <span>دارای برنامه</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <span>همه تکمیل شده</span>
        </div>
      </div>
    </div>
  );
};
