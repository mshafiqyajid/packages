import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
} from "react";
import type React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CalendarMode = "single" | "range" | "multiple";
export type CalendarView = "month" | "year" | "decade";
export type FirstDayOfWeek = 0 | 1 | 6;

export type CalendarSingleValue = Date | null;
export type CalendarRangeValue = [Date | null, Date | null];
export type CalendarMultipleValue = Date[];
export type CalendarValue =
  | CalendarSingleValue
  | CalendarRangeValue
  | CalendarMultipleValue;

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isFocused: boolean;
  weekNumber?: number;
  isMarked: boolean;
  markColor: string | undefined;
}

export type WeekRow = DayCell[];

export interface UseCalendarOptions {
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  onChange?: (value: CalendarValue) => void;
  mode?: CalendarMode;
  view?: CalendarView;
  defaultView?: CalendarView;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  disabledDays?: number[];
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: string;
  showOutsideDays?: boolean;
  showWeekNumbers?: boolean;
  fixedWeeks?: boolean;
  markedDates?: { date: Date; color?: string }[];
  showTodayButton?: boolean;
  numberOfMonths?: number;
  renderDay?: (
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    isSelected: boolean,
  ) => React.ReactNode;
}

export interface DateProps {
  role: "gridcell";
  "aria-selected": boolean;
  "aria-disabled": boolean;
  "aria-current": "date" | undefined;
  "data-selected": "" | undefined;
  "data-today": "" | undefined;
  "data-outside-month": "" | undefined;
  "data-in-range": "" | undefined;
  "data-range-start": "" | undefined;
  "data-range-end": "" | undefined;
  "data-disabled": "" | undefined;
  "data-focused": "" | undefined;
  tabIndex: number;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

export interface MonthProps {
  role: "grid";
  "aria-label": string;
  "aria-live": "polite";
}

export interface NavProps {
  prevProps: {
    "aria-label": string;
    onClick: () => void;
    disabled: boolean;
  };
  nextProps: {
    "aria-label": string;
    onClick: () => void;
    disabled: boolean;
  };
  todayProps: {
    "aria-label": string;
    onClick: () => void;
  };
  headerProps: {
    onClick: () => void;
    "aria-label": string;
  };
}

export interface UseCalendarResult {
  value: CalendarValue;
  setValue: (value: CalendarValue) => void;
  viewMonth: Date;
  setViewMonth: (month: Date) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToToday: () => void;
  weeks: WeekRow[];
  /** One WeekRow[] per month when numberOfMonths > 1 */
  allMonthsWeeks: WeekRow[][];
  /** The Date (month start) for each rendered month */
  viewMonths: Date[];
  weekDayLabels: string[];
  monthProps: MonthProps;
  navProps: NavProps;
  getDateProps: (cell: DayCell) => DateProps;
  /** Hover date for range preview */
  hoverDate: Date | null;
  setHoverDate: (date: Date | null) => void;
  /** For year view: months of viewMonth's year */
  yearMonths: Array<{ date: Date; label: string; isSelected: boolean }>;
  /** For decade view: years near viewMonth's year */
  decadeYears: Array<{ year: number; isSelected: boolean }>;
  /** Announcement text for live region */
  announcement: string;
  liveRegionId: string;
  focusedDate: Date | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function addMonths(d: Date, n: number): Date {
  const result = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return result;
}

function getISOWeekNumber(d: Date): number {
  const date = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  );
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isDateDisabled(
  date: Date,
  minDate: Date | undefined,
  maxDate: Date | undefined,
  disabledDates: Date[] | ((d: Date) => boolean) | undefined,
  disabledDays?: number[],
): boolean {
  const d = startOfDay(date);
  if (minDate && d < startOfDay(minDate)) return true;
  if (maxDate && d > startOfDay(maxDate)) return true;
  if (disabledDays && disabledDays.includes(d.getDay())) return true;
  if (!disabledDates) return false;
  if (typeof disabledDates === "function") return disabledDates(d);
  return disabledDates.some((dd) => isSameDay(dd, d));
}


function formatMonthYear(date: Date, locale: string | undefined): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function formatWeekDay(date: Date, locale: string | undefined): string {
  return date.toLocaleDateString(locale, { weekday: "short" });
}

function buildWeeks(
  viewMonth: Date,
  firstDayOfWeek: FirstDayOfWeek,
  showWeekNumbers: boolean,
  fixedWeeks: boolean,
  today: Date,
  value: CalendarValue,
  mode: CalendarMode,
  hoverDate: Date | null,
  minDate: Date | undefined,
  maxDate: Date | undefined,
  disabledDates: Date[] | ((d: Date) => boolean) | undefined,
  showOutsideDays: boolean,
  focusedDate: Date | null,
  disabledDays?: number[],
  markedDates?: { date: Date; color?: string }[],
): WeekRow[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  let startDay = firstOfMonth.getDay() - firstDayOfWeek;
  if (startDay < 0) startDay += 7;

  const gridStart = addDays(firstOfMonth, -startDay);

  const lastOfMonth = new Date(year, month + 1, 0);
  let endDay = (firstDayOfWeek - 1 - lastOfMonth.getDay() + 7) % 7;
  if (endDay === 0 && !fixedWeeks) endDay = 0;
  else if (endDay < 6) {
    endDay = 6 - lastOfMonth.getDay() + firstDayOfWeek;
    if (endDay >= 7) endDay -= 7;
    endDay = (7 - ((lastOfMonth.getDay() - firstDayOfWeek + 7) % 7) - 1) % 7;
  }

  // Number of days we need
  const daysNeeded = startDay + (lastOfMonth.getDate());
  const totalRows = fixedWeeks ? 6 : Math.ceil(daysNeeded / 7);
  const totalDays = totalRows * 7;

  const weeks: WeekRow[] = [];
  let currentWeek: DayCell[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(gridStart, i);
    const isCurrentMonth = date.getMonth() === month;
    const isTodayDate = isSameDay(date, today);
    const isDisabled = isDateDisabled(date, minDate, maxDate, disabledDates, disabledDays);

    let isSelected = false;
    let isInRangeVal = false;
    let isRangeStart = false;
    let isRangeEnd = false;

    if (mode === "single") {
      const sv = value instanceof Date ? value : null;
      isSelected = sv != null && isSameDay(date, sv);
    } else if (mode === "range") {
      const rv: CalendarRangeValue = Array.isArray(value)
        ? (value as CalendarRangeValue)
        : [null, null];
      const [start, end] = rv;
      isRangeStart = start != null && isSameDay(date, start);
      isRangeEnd = end != null && isSameDay(date, end);
      isSelected = isRangeStart || isRangeEnd;

      // Range preview with hover
      const effectiveEnd = end ?? hoverDate;
      if (start && effectiveEnd) {
        const s = startOfDay(start);
        const e = startOfDay(effectiveEnd);
        const d = startOfDay(date);
        const [lo, hi] = s <= e ? [s, e] : [e, s];
        isInRangeVal = d > lo && d < hi;
        if (s > e) {
          isRangeStart = isSameDay(date, e);
          isRangeEnd = isSameDay(date, s);
        }
      }
    } else if (mode === "multiple") {
      const mv: CalendarMultipleValue = Array.isArray(value) ? (value as CalendarMultipleValue) : [];
      isSelected = mv.some((d) => isSameDay(d, date));
    }

    const markedEntry = markedDates?.find((m) => isSameDay(m.date, date));
    const isMarked = !!markedEntry;
    const markColor = markedEntry?.color;

    const cell: DayCell = {
      date,
      isCurrentMonth,
      isToday: isTodayDate,
      isSelected,
      isDisabled,
      isInRange: isInRangeVal,
      isRangeStart,
      isRangeEnd,
      isFocused: focusedDate != null && isSameDay(date, focusedDate),
      isMarked,
      markColor,
    };

    if (showWeekNumbers && currentWeek.length === 0) {
      cell.weekNumber = getISOWeekNumber(date);
    }

    currentWeek.push(cell);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (!showOutsideDays) {
    return weeks.map((week) =>
      week.map((cell) =>
        cell.isCurrentMonth ? cell : { ...cell, date: cell.date },
      ),
    );
  }

  return weeks;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    mode = "single",
    view: controlledView,
    defaultView = "month",
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates,
    disabledDays,
    firstDayOfWeek = 0,
    locale,
    showOutsideDays = true,
    showWeekNumbers = false,
    fixedWeeks = false,
    markedDates,
    numberOfMonths = 1,
  } = options;

  const today = useMemo(() => startOfDay(new Date()), []);
  const liveRegionId = useId();

  // Uncontrolled value state
  const defaultValueInit = useMemo((): CalendarValue => {
    if (defaultValue !== undefined) return defaultValue;
    if (mode === "range") return [null, null];
    if (mode === "multiple") return [];
    return null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [internalValue, setInternalValue] = useState<CalendarValue>(defaultValueInit);
  const isValueControlled = controlledValue !== undefined;
  const value: CalendarValue = isValueControlled ? controlledValue : internalValue;

  // View state
  const [internalView, setInternalView] = useState<CalendarView>(defaultView);
  const isViewControlled = controlledView !== undefined;
  const view: CalendarView = isViewControlled ? controlledView : internalView;

  // ViewMonth state
  const defaultMonthInit = useMemo(() => {
    if (defaultMonth) return new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [internalMonth, setInternalMonth] = useState<Date>(defaultMonthInit);
  const isMonthControlled = controlledMonth !== undefined;
  const viewMonth: Date = isMonthControlled
    ? new Date(controlledMonth.getFullYear(), controlledMonth.getMonth(), 1)
    : internalMonth;

  // Hover date (for range preview)
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Focused date for keyboard navigation
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  // Announcement for live region
  const [announcement, setAnnouncement] = useState("");

  // Ref to track range start for click-sequence
  const rangeClickCountRef = useRef(0);

  const setViewMonth = useCallback(
    (month: Date) => {
      const normalized = new Date(month.getFullYear(), month.getMonth(), 1);
      if (!isMonthControlled) {
        setInternalMonth(normalized);
      }
      onMonthChange?.(normalized);
      setAnnouncement(formatMonthYear(normalized, locale));
    },
    [isMonthControlled, onMonthChange, locale],
  );

  const setView = useCallback(
    (v: CalendarView) => {
      if (!isViewControlled) setInternalView(v);
    },
    [isViewControlled],
  );

  const setValue = useCallback(
    (v: CalendarValue) => {
      if (!isValueControlled) setInternalValue(v);
      onChange?.(v);
    },
    [isValueControlled, onChange],
  );

  const goToPrev = useCallback(() => {
    if (view === "month") {
      setViewMonth(addMonths(viewMonth, -numberOfMonths));
    } else if (view === "year") {
      setViewMonth(new Date(viewMonth.getFullYear() - 1, viewMonth.getMonth(), 1));
    } else {
      setViewMonth(new Date(viewMonth.getFullYear() - 10, viewMonth.getMonth(), 1));
    }
  }, [view, viewMonth, setViewMonth, numberOfMonths]);

  const goToNext = useCallback(() => {
    if (view === "month") {
      setViewMonth(addMonths(viewMonth, numberOfMonths));
    } else if (view === "year") {
      setViewMonth(new Date(viewMonth.getFullYear() + 1, viewMonth.getMonth(), 1));
    } else {
      setViewMonth(new Date(viewMonth.getFullYear() + 10, viewMonth.getMonth(), 1));
    }
  }, [view, viewMonth, setViewMonth, numberOfMonths]);

  const goToToday = useCallback(() => {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setView("month");
  }, [today, setViewMonth, setView]);

  // Compute all view months (one per numberOfMonths)
  const viewMonths = useMemo(() => {
    return Array.from({ length: numberOfMonths }, (_, i) => addMonths(viewMonth, i));
  }, [viewMonth, numberOfMonths]);

  // Build weeks for the primary (first) month
  const weeks = useMemo(
    () =>
      buildWeeks(
        viewMonth,
        firstDayOfWeek,
        showWeekNumbers,
        fixedWeeks,
        today,
        value,
        mode,
        hoverDate,
        minDate,
        maxDate,
        disabledDates,
        showOutsideDays,
        focusedDate,
        disabledDays,
        markedDates,
      ),
    [
      viewMonth,
      firstDayOfWeek,
      showWeekNumbers,
      fixedWeeks,
      today,
      value,
      mode,
      hoverDate,
      minDate,
      maxDate,
      disabledDates,
      showOutsideDays,
      focusedDate,
      disabledDays,
      markedDates,
    ],
  );

  // Build weeks for all months (used when numberOfMonths > 1)
  const allMonthsWeeks = useMemo(
    () =>
      viewMonths.map((vm) =>
        buildWeeks(
          vm,
          firstDayOfWeek,
          showWeekNumbers,
          fixedWeeks,
          today,
          value,
          mode,
          hoverDate,
          minDate,
          maxDate,
          disabledDates,
          showOutsideDays,
          focusedDate,
          disabledDays,
          markedDates,
        ),
      ),
    [
      viewMonths,
      firstDayOfWeek,
      showWeekNumbers,
      fixedWeeks,
      today,
      value,
      mode,
      hoverDate,
      minDate,
      maxDate,
      disabledDates,
      showOutsideDays,
      focusedDate,
      disabledDays,
      markedDates,
    ],
  );

  // Build week day labels
  const weekDayLabels = useMemo(() => {
    const labels: string[] = [];
    // Start from a known date that is the correct first day of week
    // Jan 5 2025 is a Sunday
    const refSunday = new Date(2025, 0, 5);
    for (let i = 0; i < 7; i++) {
      const day = addDays(refSunday, (i + firstDayOfWeek) % 7);
      labels.push(formatWeekDay(day, locale));
    }
    return labels;
  }, [firstDayOfWeek, locale]);

  // Handle date selection
  const selectDate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, minDate, maxDate, disabledDates, disabledDays)) return;

      if (mode === "single") {
        setValue(date);
      } else if (mode === "range") {
        const rv: CalendarRangeValue = Array.isArray(value)
          ? (value as CalendarRangeValue)
          : [null, null];
        const count = rangeClickCountRef.current;

        if (count === 0 || rv[1] !== null) {
          setValue([date, null]);
          rangeClickCountRef.current = 1;
        } else {
          const start = rv[0];
          if (start) {
            const s = startOfDay(start);
            const e = startOfDay(date);
            setValue(s <= e ? [start, date] : [date, start]);
          } else {
            setValue([date, null]);
          }
          rangeClickCountRef.current = 0;
        }
      } else if (mode === "multiple") {
        const mv: CalendarMultipleValue = Array.isArray(value)
          ? (value as CalendarMultipleValue)
          : [];
        const idx = mv.findIndex((d) => isSameDay(d, date));
        setValue(idx >= 0 ? mv.filter((_, i) => i !== idx) : [...mv, date]);
      }
    },
    [mode, value, minDate, maxDate, disabledDates, disabledDays, setValue],
  );

  // Keyboard navigation
  const handleDateKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, date: Date) => {
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          next = addDays(date, 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          next = addDays(date, -1);
          break;
        case "ArrowDown":
          e.preventDefault();
          next = addDays(date, 7);
          break;
        case "ArrowUp":
          e.preventDefault();
          next = addDays(date, -7);
          break;
        case "PageDown":
          e.preventDefault();
          if (e.shiftKey) {
            next = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
          } else {
            next = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
          }
          break;
        case "PageUp":
          e.preventDefault();
          if (e.shiftKey) {
            next = new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
          } else {
            next = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
          }
          break;
        case "Home":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            next = new Date(date.getFullYear(), date.getMonth(), 1);
          } else {
            // Go to start of week
            const dow = (date.getDay() - firstDayOfWeek + 7) % 7;
            next = addDays(date, -dow);
          }
          break;
        case "End":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            next = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          } else {
            // Go to end of week
            const dow2 = (date.getDay() - firstDayOfWeek + 7) % 7;
            next = addDays(date, 6 - dow2);
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          selectDate(date);
          return;
        default:
          return;
      }

      if (next) {
        setFocusedDate(next);
        // If navigated to a different month, update viewMonth
        if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) {
          setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1));
        }
      }
    },
    [firstDayOfWeek, selectDate, viewMonth, setViewMonth],
  );

  // focusedDate ref for DOM focus management
  const focusedDateRef = useRef<Date | null>(null);
  useEffect(() => {
    focusedDateRef.current = focusedDate;
  }, [focusedDate]);

  // getDateProps factory
  const getDateProps = useCallback(
    (cell: DayCell): DateProps => {
      return {
        role: "gridcell",
        "aria-selected": cell.isSelected,
        "aria-disabled": cell.isDisabled,
        "aria-current": cell.isToday ? "date" : undefined,
        "data-selected": cell.isSelected ? "" : undefined,
        "data-today": cell.isToday ? "" : undefined,
        "data-outside-month": !cell.isCurrentMonth ? "" : undefined,
        "data-in-range": cell.isInRange ? "" : undefined,
        "data-range-start": cell.isRangeStart ? "" : undefined,
        "data-range-end": cell.isRangeEnd ? "" : undefined,
        "data-disabled": cell.isDisabled ? "" : undefined,
        "data-focused": cell.isFocused ? "" : undefined,
        tabIndex: cell.isFocused || (focusedDate === null && cell.isToday && cell.isCurrentMonth) ? 0 : -1,
        onClick: () => selectDate(cell.date),
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => handleDateKeyDown(e, cell.date),
      };
    },
    [selectDate, handleDateKeyDown, focusedDate],
  );

  // monthProps
  const monthProps = useMemo(
    (): MonthProps => ({
      role: "grid",
      "aria-label": formatMonthYear(viewMonth, locale),
      "aria-live": "polite",
    }),
    [viewMonth, locale],
  );

  // navProps
  const navProps = useMemo(
    (): NavProps => ({
      prevProps: {
        "aria-label": view === "month" ? "Previous month" : view === "year" ? "Previous year" : "Previous decade",
        onClick: goToPrev,
        disabled: false,
      },
      nextProps: {
        "aria-label": view === "month" ? "Next month" : view === "year" ? "Next year" : "Next decade",
        onClick: goToNext,
        disabled: false,
      },
      todayProps: {
        "aria-label": "Go to today",
        onClick: goToToday,
      },
      headerProps: {
        onClick: () => {
          if (view === "month") setView("year");
          else if (view === "year") setView("decade");
        },
        "aria-label":
          view === "month"
            ? `${formatMonthYear(viewMonth, locale)}, click to view year`
            : view === "year"
            ? `${viewMonth.getFullYear()}, click to view decade`
            : `${Math.floor(viewMonth.getFullYear() / 10) * 10}–${Math.floor(viewMonth.getFullYear() / 10) * 10 + 9}`,
      },
    }),
    [view, goToPrev, goToNext, goToToday, viewMonth, locale, setView],
  );

  // Year view: 12 months
  const yearMonths = useMemo(() => {
    const year = viewMonth.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
      let isSelected = false;
      if (mode === "single") {
        const sv = value as CalendarSingleValue;
        isSelected = sv != null && sv.getFullYear() === year && sv.getMonth() === i;
      } else if (mode === "range") {
        const rv = value as CalendarRangeValue;
        isSelected =
          (rv[0] != null && rv[0].getFullYear() === year && rv[0].getMonth() === i) ||
          (rv[1] != null && rv[1].getFullYear() === year && rv[1].getMonth() === i);
      }
      return {
        date,
        label: date.toLocaleDateString(locale, { month: "short" }),
        isSelected,
      };
    });
  }, [viewMonth, value, mode, locale]);

  // Decade view: 10 years
  const decadeYears = useMemo(() => {
    const decadeStart = Math.floor(viewMonth.getFullYear() / 10) * 10;
    return Array.from({ length: 12 }, (_, i) => {
      const year = decadeStart - 1 + i;
      let isSelected = false;
      if (mode === "single") {
        const sv = value as CalendarSingleValue;
        isSelected = sv != null && sv.getFullYear() === year;
      } else if (mode === "range") {
        const rv = value as CalendarRangeValue;
        isSelected =
          (rv[0] != null && rv[0].getFullYear() === year) ||
          (rv[1] != null && rv[1].getFullYear() === year);
      }
      return { year, isSelected };
    });
  }, [viewMonth, value, mode]);

  return {
    value,
    setValue,
    viewMonth,
    setViewMonth,
    view,
    setView,
    goToPrev,
    goToNext,
    goToToday,
    weeks,
    allMonthsWeeks,
    viewMonths,
    weekDayLabels,
    monthProps,
    navProps,
    getDateProps,
    hoverDate,
    setHoverDate,
    yearMonths,
    decadeYears,
    announcement,
    liveRegionId,
    focusedDate,
  };
}
