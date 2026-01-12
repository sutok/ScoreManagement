import { type RecurringPattern } from '../types/facility';

/**
 * Day of week constants
 */
export const DAYS_OF_WEEK = [
  '日曜日',
  '月曜日',
  '火曜日',
  '水曜日',
  '木曜日',
  '金曜日',
  '土曜日',
] as const;

/**
 * Week of month constants
 */
export const WEEKS_OF_MONTH = [
  { value: 1, label: '第1週' },
  { value: 2, label: '第2週' },
  { value: 3, label: '第3週' },
  { value: 4, label: '第4週' },
  { value: 5, label: '第5週' },
] as const;

/**
 * Calculate the next occurrence of a recurring pattern
 * @param pattern - The recurring pattern
 * @param fromDate - Date to calculate from (defaults to today)
 * @returns Next occurrence date
 */
export const calculateNextOccurrence = (
  pattern: RecurringPattern,
  fromDate: Date = new Date()
): Date => {
  if (pattern.frequency === 'monthly') {
    return calculateMonthlyOccurrence(pattern, fromDate);
  } else if (pattern.frequency === 'weekly') {
    return calculateWeeklyOccurrence(pattern, fromDate);
  }

  throw new Error(`Unsupported frequency: ${pattern.frequency}`);
};

/**
 * Calculate next monthly occurrence (e.g., "毎月第3水曜日")
 */
const calculateMonthlyOccurrence = (
  pattern: RecurringPattern,
  fromDate: Date
): Date => {
  if (!pattern.weekOfMonth) {
    throw new Error('weekOfMonth is required for monthly patterns');
  }

  const targetDayOfWeek = pattern.dayOfWeek;
  const targetWeekOfMonth = pattern.weekOfMonth;

  // Start from next month
  let targetDate = new Date(fromDate);
  targetDate.setMonth(targetDate.getMonth() + 1);
  targetDate.setDate(1);
  targetDate.setHours(0, 0, 0, 0);

  // Find the first occurrence of the target day in the month
  while (targetDate.getDay() !== targetDayOfWeek) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Move to the target week
  targetDate.setDate(targetDate.getDate() + (targetWeekOfMonth - 1) * 7);

  // Set the time
  const [hours, minutes] = pattern.time.split(':').map(Number);
  targetDate.setHours(hours, minutes, 0, 0);

  return targetDate;
};

/**
 * Calculate next weekly occurrence
 */
const calculateWeeklyOccurrence = (
  pattern: RecurringPattern,
  fromDate: Date
): Date => {
  const targetDayOfWeek = pattern.dayOfWeek;

  let targetDate = new Date(fromDate);
  targetDate.setDate(targetDate.getDate() + 1); // Start from tomorrow
  targetDate.setHours(0, 0, 0, 0);

  // Find the next occurrence of the target day
  while (targetDate.getDay() !== targetDayOfWeek) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Set the time
  const [hours, minutes] = pattern.time.split(':').map(Number);
  targetDate.setHours(hours, minutes, 0, 0);

  return targetDate;
};

/**
 * Format recurring pattern to human-readable string
 * @param pattern - The recurring pattern
 * @returns Formatted string (e.g., "毎月第3水曜日 19:00")
 */
export const formatRecurringPattern = (pattern: RecurringPattern): string => {
  const dayName = DAYS_OF_WEEK[pattern.dayOfWeek];

  if (pattern.frequency === 'monthly' && pattern.weekOfMonth) {
    const weekLabel = WEEKS_OF_MONTH.find(w => w.value === pattern.weekOfMonth)?.label || '';
    return `毎月${weekLabel}${dayName} ${pattern.time}`;
  } else if (pattern.frequency === 'weekly') {
    return `毎週${dayName} ${pattern.time}`;
  }

  return '不明なパターン';
};

/**
 * Get the date of a specific week and day in a given month
 * @param year - Year
 * @param month - Month (0-11)
 * @param weekOfMonth - Week of month (1-5)
 * @param dayOfWeek - Day of week (0-6, 0=Sunday)
 * @returns Date or null if the week doesn't exist in that month
 */
export const getDateInMonth = (
  year: number,
  month: number,
  weekOfMonth: number,
  dayOfWeek: number
): Date | null => {
  // Get the first day of the month
  const firstDay = new Date(year, month, 1);

  // Find the first occurrence of the target day
  let targetDate = new Date(firstDay);
  while (targetDate.getDay() !== dayOfWeek) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Move to the target week
  targetDate.setDate(targetDate.getDate() + (weekOfMonth - 1) * 7);

  // Check if we're still in the same month
  if (targetDate.getMonth() !== month) {
    return null;
  }

  return targetDate;
};

/**
 * Validate a recurring pattern
 * @param pattern - The pattern to validate
 * @returns Validation result
 */
export const validateRecurringPattern = (
  pattern: Partial<RecurringPattern>
): { valid: boolean; error?: string } => {
  if (!pattern.frequency) {
    return { valid: false, error: '頻度を選択してください' };
  }

  if (pattern.dayOfWeek === undefined || pattern.dayOfWeek < 0 || pattern.dayOfWeek > 6) {
    return { valid: false, error: '曜日を選択してください' };
  }

  if (pattern.frequency === 'monthly') {
    if (!pattern.weekOfMonth || pattern.weekOfMonth < 1 || pattern.weekOfMonth > 5) {
      return { valid: false, error: '週を選択してください（第1〜5週）' };
    }
  }

  if (!pattern.time || !/^\d{2}:\d{2}$/.test(pattern.time)) {
    return { valid: false, error: '時刻を正しい形式で入力してください（例: 19:00）' };
  }

  const [hours, minutes] = pattern.time.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return { valid: false, error: '時刻は00:00〜23:59の範囲で入力してください' };
  }

  return { valid: true };
};
