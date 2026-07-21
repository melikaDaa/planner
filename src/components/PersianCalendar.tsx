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
        className={`relative h-9 w-9 flex items-center justify-center text-sm rounded-full transition-all duration-200 cursor-pointer focus:outline-none group
          ${isActive 
            ? "bg-[#8c7851] text-white font-semibold paper-shadow scale-105" 
            : isToday 
              ? "border border-[#8c7851] text-[#8c7851] font-semibold" 
              : "text-[#44403c] hover:bg-[#f5ebe0]"
          }
        `}
      >
        <span>{toPersianDigits(d)}</span>
        
        {/* Activity Indicator Dots */}
        {hasActivity && !isActive && (
          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${allDone ? 'bg-emerald-500' : 'bg-[#c5b394]'}`} />
        )}
      </button>
    );
  }

  return (
    <div className="w-full bg-[#fcfbf9] border border-[#eaddcf] rounded-2xl p-4 paper-shadow font-sans">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 border-b border-[#f5ebe0] pb-3">
        <button
          id="btn-next-month"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-[#f5ebe0] text-[#7c6a46] cursor-pointer transition-colors"
          title="ماه بعد"
        >
          <ChevronRight size={18} />
        </button>

        <div className="flex items-center gap-1.5 text-[#574f41] font-medium text-base select-none">
          <CalendarIcon size={16} className="text-[#a89a7a]" />
          <span>{JALALI_MONTH_NAMES[viewJalali.jm - 1]}</span>
          <span>{toPersianDigits(viewJalali.jy)}</span>
        </div>

        <button
          id="btn-prev-month"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-[#f5ebe0] text-[#7c6a46] cursor-pointer transition-colors"
          title="ماه قبل"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Weekdays Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#8c7a5c] mb-2 border-b border-[#faf5ef] pb-1">
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
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#f5ebe0] text-[11px] text-[#8c7a5c]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[#8c7851]" />
          <span>امروز</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c5b394]" />
          <span>دارای برنامه</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>همه تکمیل شده</span>
        </div>
      </div>
    </div>
  );
};
