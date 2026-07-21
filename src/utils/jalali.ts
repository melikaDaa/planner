/**
 * Jalali (Shamsi) Calendar Conversion Utility
 * Designed with native browser Intl support and robust mathematical converters.
 */

export interface JalaliDate {
  jy: number; // Jalali Year (e.g., 1405)
  jm: number; // Jalali Month (1 to 12)
  jd: number; // Jalali Day (1 to 31)
}

/**
 * Converts a Gregorian Date to Jalali Year, Month, Day.
 */
export function gregorianToJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let j_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  let jy = 979 + 33 * Math.floor(j_day_no / 12053); /* 12053 = 365*33 + 32/4 */
  j_day_no %= 12053;
  jy += 4 * Math.floor(j_day_no / 1461); /* 1461 = 365*4 + 1 */
  j_day_no %= 1461;
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  let jm = 1;
  for (; jm <= 11; ++jm) {
    const daysInMonth = (jm <= 6) ? 31 : 30;
    if (j_day_no < daysInMonth) {
      break;
    }
    j_day_no -= daysInMonth;
  }
  let jd = j_day_no + 1;
  return { jy, jm, jd };
}

/**
 * Converts Jalali Year, Month, Day to a Gregorian Date (centered at noon to avoid timezone shift).
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const jy_fixed = jy - 979;
  const jm_fixed = jm - 1;
  const jd_fixed = jd - 1;

  let jalaliDays = jy_fixed * 365 + Math.floor(jy_fixed / 33) * 8 + Math.floor(((jy_fixed % 33) + 3) / 4);
  for (let i = 0; i < jm_fixed; ++i) {
    if (i < 6) {
      jalaliDays += 31;
    } else {
      jalaliDays += 30;
    }
  }
  jalaliDays += jd_fixed;

  let g_day_no = jalaliDays + 79;

  let gy = 1600 + 400 * Math.floor(g_day_no / 146097); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
  g_day_no = g_day_no % 146097;

  let leap = true;
  if (g_day_no >= 36525) { /* 36525 = 365*100 + 100/4 */
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524); /* 36524 = 365*100 + 100/4 - 1 */
    g_day_no = g_day_no % 36524;

    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(g_day_no / 1461); /* 1461 = 365*4 + 1 */
  g_day_no = g_day_no % 1461;

  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  let gd = g_day_no + 1;
  const g_days_in_month = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  for (; gm <= 12; ++gm) {
    if (gd <= g_days_in_month[gm]) {
      break;
    }
    gd -= g_days_in_month[gm];
  }

  return new Date(gy, gm - 1, gd, 12, 0, 0);
}

/**
 * Checks if a Jalali year is a leap year.
 */
export function isJalaliLeapYear(jy: number): boolean {
  const r = (jy - 474) % 2820;
  const c = (r + 474) % 33;
  return ((c + 3) % 33) % 4 === 0 && c !== 30;
}

/**
 * Returns number of days in a given Jalali month.
 */
export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) {
    return isJalaliLeapYear(jy) ? 30 : 29;
  }
  return 30;
}

/**
 * Names of the Jalali months.
 */
export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند"
];

/**
 * Names of Persian weekdays.
 */
export const PERSIAN_WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه"
];

/**
 * Formats a Gregorian Date to standard Persian verbal date.
 * E.g., "شنبه، ۲۹ تیر ۱۴۰۵"
 */
export function formatPersianDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Converts English digits to Persian digits.
 */
export function toPersianDigits(num: number | string): string {
  const pDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => pDigits[parseInt(d, 10)]);
}

/**
 * Converts a Gregorian date string format (YYYY-MM-DD) into a Date object.
 */
export function parseGregorianDateString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Formats a Gregorian Date into a safe YYYY-MM-DD local representation.
 */
export function toGregorianDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Gets the Persian weekday index (0 for شنبه (Saturday) to 6 for جمعه (Friday)).
 */
export function getPersianWeekdayIndex(date: Date): number {
  const gDay = date.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  // Map Gregorian day to Persian day index
  // Sat: 6 -> 0
  // Sun: 0 -> 1
  // Mon: 1 -> 2
  // Tue: 2 -> 3
  // Wed: 3 -> 4
  // Thu: 4 -> 5
  // Fri: 5 -> 6
  return (gDay + 1) % 7;
}
