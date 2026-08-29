export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export type ActivityDay = {
  date: Date;
  level: ActivityLevel;
};

export type CalendarCell = ActivityDay | null;

export type YearWeekColumn = CalendarCell[];

export type YearGrid = {
  year: number;
  weeks: YearWeekColumn[];
  startMonth: number;
  endMonth: number;
};

export type MonthRegion = {
  label: string;
  spanWeeks: number;
};

export type YearMetrics = {
  weekCount: number;
  gridHeight: number;
  gap: number;
};

export type ActivityByDate = ReadonlyMap<string, ActivityLevel>;

export const CALENDAR_COLUMNS = 7;
export const CELL_GAP = 3;
export const YEAR_PAGE_COUNT = 2;
export const MONTHS_PER_YEAR_PAGE = 6;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getMonthLabel(monthIndex: number) {
  return MONTH_LABELS[monthIndex];
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatActivityDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getYearPageMonthRange(pageIndex: number) {
  const startMonth = pageIndex * MONTHS_PER_YEAR_PAGE;
  return { startMonth, endMonth: startMonth + MONTHS_PER_YEAR_PAGE - 1 };
}

export function computeYearMetrics(containerWidth: number, weekCount: number): YearMetrics {
  if (containerWidth <= 0 || weekCount <= 0) {
    return { weekCount: 0, gridHeight: 0, gap: CELL_GAP };
  }

  const columnWidth = (containerWidth - (weekCount - 1) * CELL_GAP) / weekCount;
  const gridHeight = CALENDAR_COLUMNS * columnWidth + (CALENDAR_COLUMNS - 1) * CELL_GAP;

  return { weekCount, gridHeight, gap: CELL_GAP };
}

export function getYearMonthRegions(weeks: YearWeekColumn[]): MonthRegion[] {
  if (weeks.length === 0) return [];

  const regions: MonthRegion[] = [];
  let regionStart = 0;
  let currentMonth = getWeekAnchorMonth(weeks[0]);

  for (let weekIndex = 1; weekIndex <= weeks.length; weekIndex++) {
    const nextMonth =
      weekIndex < weeks.length ? getWeekAnchorMonth(weeks[weekIndex]) : -1;

    if (weekIndex === weeks.length || nextMonth !== currentMonth) {
      regions.push({
        label: getMonthLabel(currentMonth),
        spanWeeks: weekIndex - regionStart,
      });

      if (weekIndex < weeks.length) {
        regionStart = weekIndex;
        currentMonth = nextMonth;
      }
    }
  }

  return regions;
}

function getWeekAnchorMonth(week: YearWeekColumn) {
  const firstInMonth = week.find(
    (day) => day !== null && day.date.getDate() === 1,
  );
  if (firstInMonth) return firstInMonth.date.getMonth();

  const firstDay = week.find((day) => day !== null);
  return firstDay ? firstDay.date.getMonth() : 0;
}

function hash(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function hashString(value: string) {
  let seed = 0;
  for (let index = 0; index < value.length; index++) {
    seed = (seed * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(seed);
}

export function startOfWeekMonday(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function generateLevel(seed: number, previousLevel: ActivityLevel): ActivityLevel {
  const roll = hash(seed * 17 + 31);
  const clusterBoost = previousLevel > 0 ? 0.22 : 0;

  if (roll < 0.48 - clusterBoost) return 0;
  if (roll < 0.68) return 1;
  if (roll < 0.84) return 2;
  if (roll < 0.94) return 3;
  return 4;
}

function eachDayInRange(start: Date, end: Date, callback: (date: Date) => void) {
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const limit = new Date(end);
  limit.setHours(0, 0, 0, 0);

  while (cursor <= limit) {
    callback(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
}

export function createMockActivityByDate(
  rangeStart: Date,
  rangeEnd: Date,
  referenceDate = new Date(),
): ActivityByDate {
  const map = new Map<string, ActivityLevel>();
  const today = new Date(referenceDate);
  today.setHours(23, 59, 59, 999);

  let previousLevel: ActivityLevel = 0;

  eachDayInRange(rangeStart, rangeEnd, (date) => {
    const key = toDateKey(date);
    if (date > today) {
      map.set(key, 0);
      return;
    }

    const level = generateLevel(hashString(key), previousLevel);
    previousLevel = level;
    map.set(key, level);
  });

  return map;
}

export function getActivityLevel(activityByDate: ActivityByDate, date: Date): ActivityLevel {
  return activityByDate.get(toDateKey(date)) ?? 0;
}

export function getYearGrid(year: number, activityByDate: ActivityByDate): YearGrid {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const gridStart = startOfWeekMonday(yearStart);
  const gridEnd = new Date(startOfWeekMonday(yearEnd));
  gridEnd.setDate(gridEnd.getDate() + 6);

  const weeks: YearWeekColumn[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week: YearWeekColumn = [];

    for (let offset = 0; offset < CALENDAR_COLUMNS; offset++) {
      const date = new Date(cursor);
      date.setDate(cursor.getDate() + offset);

      if (date.getFullYear() === year) {
        week.push({
          date,
          level: getActivityLevel(activityByDate, date),
        });
      } else {
        week.push(null);
      }
    }

    weeks.push(week);
    cursor.setDate(cursor.getDate() + 7);
  }

  return { year, weeks, startMonth: 0, endMonth: 11 };
}

export function getYearPageGrid(
  year: number,
  pageIndex: number,
  activityByDate: ActivityByDate,
): YearGrid {
  const { startMonth, endMonth } = getYearPageMonthRange(pageIndex);
  const full = getYearGrid(year, activityByDate);
  const rangeStart = new Date(year, startMonth, 1);
  const rangeEnd = new Date(year, endMonth + 1, 0);

  let startIndex = -1;
  let endIndex = -1;

  full.weeks.forEach((week, index) => {
    const hasDayInRange = week.some(
      (day) => day !== null && day.date >= rangeStart && day.date <= rangeEnd,
    );

    if (hasDayInRange) {
      if (startIndex === -1) startIndex = index;
      endIndex = index;
    }
  });

  return {
    year,
    weeks: startIndex >= 0 ? full.weeks.slice(startIndex, endIndex + 1) : [],
    startMonth,
    endMonth,
  };
}

export function getDefaultActivityRange(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  return {
    start: new Date(year - 1, 0, 1),
    end: new Date(year + 1, 11, 31),
  };
}
