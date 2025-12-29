// =============================================================================
// DATE UTILITIES
// =============================================================================
// Date manipulation utilities for generating realistic time-based data.
// =============================================================================

/**
 * Adds days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds months to a date
 *
 * @param date - Starting date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Adds years to a date
 *
 * @param date - Starting date
 * @param years - Number of years to add (can be negative)
 * @returns New date with years added
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Format types for formatDate function
 */
export type DateFormat =
  | 'M/D/YY'       // 1/5/25
  | 'MM/DD/YYYY'   // 01/05/2025
  | 'YYYY-MM-DD'   // 2025-01-05 (ISO)
  | 'Mon D'        // Jan 5
  | 'Mon D, YYYY'  // Jan 5, 2025
  | 'Month YYYY'   // January 2025
  | 'Mon'          // Jan
  | 'Month';       // January

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats a date according to the specified format
 *
 * @param date - Date to format
 * @param format - Format string
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: DateFormat): string {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);

  switch (format) {
    case 'M/D/YY':
      return `${month + 1}/${day}/${shortYear}`;
    case 'MM/DD/YYYY':
      return `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'Mon D':
      return `${MONTH_SHORT[month]} ${day}`;
    case 'Mon D, YYYY':
      return `${MONTH_SHORT[month]} ${day}, ${year}`;
    case 'Month YYYY':
      return `${MONTH_NAMES[month]} ${year}`;
    case 'Mon':
      return MONTH_SHORT[month];
    case 'Month':
      return MONTH_NAMES[month];
    default:
      return date.toISOString();
  }
}

/**
 * Parses a date string in M/D/YY format
 *
 * @param dateStr - Date string like "1/5/25"
 * @returns Parsed Date object
 */
export function parseShortDate(dateStr: string): Date {
  const [m, d, y] = dateStr.split('/');
  const year = parseInt(y) + 2000; // Assume 20xx
  return new Date(year, parseInt(m) - 1, parseInt(d));
}

/**
 * Gets the number of months between two dates
 *
 * @param start - Start date
 * @param end - End date
 * @returns Number of months (can be negative if end < start)
 */
export function getMonthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

/**
 * Gets the number of days between two dates
 *
 * @param start - Start date
 * @param end - End date
 * @returns Number of days (can be negative if end < start)
 */
export function getDaysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 *
 * @param date - Date to check
 * @returns True if weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Checks if a date is a weekday (Monday through Friday)
 *
 * @param date - Date to check
 * @returns True if weekday
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Gets the number of business days between two dates
 * Excludes weekends
 *
 * @param start - Start date
 * @param end - End date
 * @returns Number of business days
 */
export function getBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (isWeekday(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Gets the start of a month (first day, midnight)
 *
 * @param date - Any date in the month
 * @returns First day of the month at midnight
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Gets the end of a month (last day, 23:59:59)
 *
 * @param date - Any date in the month
 * @returns Last day of the month
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Gets the start of a year (January 1st, midnight)
 *
 * @param date - Any date in the year
 * @returns January 1st of that year
 */
export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Gets the quarter (1-4) for a date
 *
 * @param date - Date to check
 * @returns Quarter number (1-4)
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Gets the start of a quarter
 *
 * @param date - Any date in the quarter
 * @returns First day of the quarter
 */
export function startOfQuarter(date: Date): Date {
  const quarter = getQuarter(date);
  const startMonth = (quarter - 1) * 3;
  return new Date(date.getFullYear(), startMonth, 1);
}

/**
 * Checks if two dates are the same day
 *
 * @param a - First date
 * @param b - Second date
 * @returns True if same day
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Checks if two dates are in the same month
 *
 * @param a - First date
 * @param b - Second date
 * @returns True if same month and year
 */
export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

/**
 * Generates an array of months between two dates
 *
 * @param start - Start date
 * @param end - End date
 * @returns Array of Date objects, one for each month
 */
export function getMonthRange(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const current = startOfMonth(start);
  const endMonth = startOfMonth(end);

  while (current <= endMonth) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Gets the day of week name
 *
 * @param date - Date to check
 * @param short - Return short name (Mon) vs full (Monday)
 * @returns Day name
 */
export function getDayName(date: Date, short = false): string {
  const days = short
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Gets the progress through a month (0-1)
 *
 * @param date - Date to check
 * @returns Fraction of month completed
 */
export function getMonthProgress(date: Date): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const totalDays = getDaysBetween(start, end) + 1;
  const daysPassed = date.getDate();
  return daysPassed / totalDays;
}

/**
 * Converts ISO date string to Date object
 *
 * @param isoString - ISO date string
 * @returns Date object
 */
export function fromISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Converts Date to ISO string
 *
 * @param date - Date object
 * @returns ISO string
 */
export function toISO(date: Date): string {
  return date.toISOString();
}

/**
 * Gets today's date at midnight
 *
 * @returns Today at midnight
 */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Checks if a date is in the past
 *
 * @param date - Date to check
 * @returns True if before today
 */
export function isPast(date: Date): boolean {
  return date < today();
}

/**
 * Checks if a date is in the future
 *
 * @param date - Date to check
 * @returns True if after today
 */
export function isFuture(date: Date): boolean {
  return date > today();
}
