import { useState, useCallback, useMemo } from "react";
import {
  isSameDay,
  isBetween,
  startOfDay,
  addMonths,
  getCalendarDays,
} from "./dateUtils";

export type DatePickerMode = "single" | "range";
export type RangeValue = [Date, Date];

export type MonthYear = { month: number; year: number };
export type DateModifiers = Record<
  string,
  Date[] | ((date: Date) => boolean)
>;

export interface UseDatePickerOptions {
  mode?: DatePickerMode;
  value?: Date | RangeValue | null;
  defaultValue?: Date | RangeValue | null;
  onChange?: (value: Date | RangeValue | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  disabledDates?: Date[] | ((date: Date) => boolean);
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  /** Controlled month view. */
  month?: MonthYear;
  /** Default month view (uncontrolled). Falls back to value || today. */
  defaultMonth?: MonthYear;
  /** Fires when the calendar's visible month changes. */
  onMonthChange?: (month: number, year: number) => void;
  /** Tag dates with arbitrary modifier names. Each match emits `data-mod-<name>="true"`. */
  modifiers?: DateModifiers;
  /** Pad to 6 rows (42 cells) when true, otherwise trim trailing all-outside rows. Default true. */
  fixedWeeks?: boolean;
}

export interface DayProps {
  date: Date;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  tabIndex: number;
  "aria-selected": boolean;
  "aria-disabled": boolean;
  "data-today": boolean;
  "data-selected": boolean;
  "data-in-range": boolean;
  "data-range-start": boolean;
  "data-range-end": boolean;
  "data-outside-month": boolean;
  "data-disabled": boolean;
  /** Space-joined list of matched modifier names (`""` if none). */
  "data-modifiers": string;
}

export interface UseDatePickerReturn {
  selected: Date | RangeValue | null;
  month: number;
  year: number;
  days: Date[];
  /** Days for the visible month + N additional months ahead. */
  getDaysFor: (monthOffset: number) => Date[];
  /** Returns { month, year } for the visible month + offset. */
  getMonthYearAt: (monthOffset: number) => MonthYear;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  /** Move the visible month by N months. Negative goes back. */
  shiftMonth: (delta: number) => void;
  getDayProps: (date: Date) => DayProps;
  isSelected: (date: Date) => boolean;
  isInRange: (date: Date) => boolean;
  isDisabled: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  /** Returns matched modifier names for a date. */
  getModifiers: (date: Date) => string[];
  /** Returns the ISO 8601 week number for a date. */
  getWeekNumber: (date: Date) => number;
  hoverDate: Date | null;
  setHoverDate: (date: Date | null) => void;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
}

function matchesModifier(
  date: Date,
  rule: Date[] | ((date: Date) => boolean),
): boolean {
  if (typeof rule === "function") return rule(date);
  return rule.some((d) => isSameDay(d, date));
}

function trimTrailingOutsideRows(days: Date[], viewMonth: number): Date[] {
  // 42 cells = 6 rows of 7. Keep rows that contain at least one in-month day.
  const rows: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }
  while (rows.length > 0) {
    const last = rows[rows.length - 1]!;
    if (last.every((d) => d.getMonth() !== viewMonth)) {
      rows.pop();
      continue;
    }
    break;
  }
  return rows.flat();
}

export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  const {
    mode = "single",
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabled = false,
    disabledDates,
    weekStartsOn = 0,
    locale,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    modifiers,
    fixedWeeks = true,
  } = options;

  const isControlled = value !== undefined;
  const isMonthControlled = controlledMonth !== undefined;

  const resolveInitial = (): Date | RangeValue | null => {
    const init = isControlled ? value : (defaultValue ?? null);
    return init ?? null;
  };

  const [internalSelected, setInternalSelected] = useState<Date | RangeValue | null>(resolveInitial);
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = useMemo(() => new Date(), []);

  const initView: MonthYear = (() => {
    if (defaultMonth) return defaultMonth;
    const s = isControlled ? value : internalSelected;
    if (s === null || s === undefined) return { month: today.getMonth(), year: today.getFullYear() };
    if (Array.isArray(s)) return { month: s[0].getMonth(), year: s[0].getFullYear() };
    return { month: (s as Date).getMonth(), year: (s as Date).getFullYear() };
  })();

  const [internalView, setInternalView] = useState<MonthYear>(initView);
  const view: MonthYear = isMonthControlled ? controlledMonth! : internalView;
  const viewMonth = view.month;
  const viewYear = view.year;

  const selected = isControlled ? (value ?? null) : internalSelected;

  const isToday = useCallback(
    (date: Date) => isSameDay(date, today),
    [today],
  );

  const isDisabled = useCallback(
    (date: Date) => {
      if (disabled) return true;
      const d = startOfDay(date);
      if (minDate && d < startOfDay(minDate)) return true;
      if (maxDate && d > startOfDay(maxDate)) return true;
      if (disabledDates) {
        if (typeof disabledDates === "function") {
          if (disabledDates(date)) return true;
        } else {
          if (disabledDates.some((dd) => isSameDay(dd, date))) return true;
        }
      }
      return false;
    },
    [disabled, minDate, maxDate, disabledDates],
  );

  const isSelected = useCallback(
    (date: Date) => {
      if (!selected) return false;
      if (Array.isArray(selected)) {
        return isSameDay(date, selected[0]) || isSameDay(date, selected[1]);
      }
      return isSameDay(date, selected as Date);
    },
    [selected],
  );

  const isInRange = useCallback(
    (date: Date) => {
      if (mode !== "range") return false;
      let start: Date | null = null;
      let end: Date | null = null;

      if (selected && Array.isArray(selected)) {
        [start, end] = selected as RangeValue;
      } else if (rangeAnchor && hoverDate) {
        start = rangeAnchor;
        end = hoverDate;
      }

      if (!start || !end) return false;
      return isBetween(date, start, end);
    },
    [mode, selected, rangeAnchor, hoverDate],
  );

  const getModifiers = useCallback(
    (date: Date): string[] => {
      if (!modifiers) return [];
      const out: string[] = [];
      for (const [name, rule] of Object.entries(modifiers)) {
        if (matchesModifier(date, rule)) out.push(name);
      }
      return out;
    },
    [modifiers],
  );

  const commit = useCallback(
    (next: Date | RangeValue | null) => {
      if (!isControlled) setInternalSelected(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const handleDayClick = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;
      if (mode === "single") {
        commit(date);
        return;
      }
      if (!rangeAnchor) {
        setRangeAnchor(date);
        commit(null);
      } else {
        const a = startOfDay(rangeAnchor);
        const b = startOfDay(date);
        const range: RangeValue = a <= b ? [a, b] : [b, a];
        setRangeAnchor(null);
        setHoverDate(null);
        commit(range);
      }
    },
    [isDisabled, mode, rangeAnchor, commit],
  );

  const handleKeyDown = useCallback(
    (date: Date) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDayClick(date);
      }
    },
    [handleDayClick],
  );

  const days = useMemo(() => {
    const raw = getCalendarDays(viewYear, viewMonth, weekStartsOn);
    return fixedWeeks ? raw : trimTrailingOutsideRows(raw, viewMonth);
  }, [viewYear, viewMonth, weekStartsOn, fixedWeeks]);

  const getDaysFor = useCallback(
    (monthOffset: number) => {
      const target = addMonths(new Date(viewYear, viewMonth, 1), monthOffset);
      const raw = getCalendarDays(target.getFullYear(), target.getMonth(), weekStartsOn);
      return fixedWeeks ? raw : trimTrailingOutsideRows(raw, target.getMonth());
    },
    [viewMonth, viewYear, weekStartsOn, fixedWeeks],
  );

  const getMonthYearAt = useCallback(
    (monthOffset: number): MonthYear => {
      const target = addMonths(new Date(viewYear, viewMonth, 1), monthOffset);
      return { month: target.getMonth(), year: target.getFullYear() };
    },
    [viewMonth, viewYear],
  );

  const getDayProps = useCallback(
    (date: Date): DayProps => {
      const sel = isSelected(date);
      const inRange = isInRange(date);
      const dis = isDisabled(date);
      const outsideMonth = date.getMonth() !== viewMonth;
      const mods = getModifiers(date).join(" ");

      const isRangeStart =
        mode === "range"
          ? selected && Array.isArray(selected)
            ? isSameDay(date, (selected as RangeValue)[0])
            : !!rangeAnchor && isSameDay(date, rangeAnchor)
          : false;

      const isRangeEnd =
        mode === "range" && selected && Array.isArray(selected)
          ? isSameDay(date, (selected as RangeValue)[1])
          : false;

      return {
        date,
        onClick: () => handleDayClick(date),
        onKeyDown: handleKeyDown(date),
        tabIndex: dis || outsideMonth ? -1 : 0,
        "aria-selected": sel,
        "aria-disabled": dis,
        "data-today": isToday(date),
        "data-selected": sel,
        "data-in-range": inRange,
        "data-range-start": isRangeStart,
        "data-range-end": isRangeEnd,
        "data-outside-month": outsideMonth,
        "data-disabled": dis,
        "data-modifiers": mods,
      };
    },
    [isSelected, isInRange, isDisabled, isToday, handleDayClick, handleKeyDown, viewMonth, mode, selected, rangeAnchor, getModifiers],
  );

  const updateViewWith = useCallback(
    (compute: (current: MonthYear) => MonthYear) => {
      if (isMonthControlled) {
        const next = compute(controlledMonth!);
        onMonthChange?.(next.month, next.year);
        return;
      }
      setInternalView((prev) => {
        const next = compute(prev);
        onMonthChange?.(next.month, next.year);
        return next;
      });
    },
    [isMonthControlled, controlledMonth, onMonthChange],
  );

  const shiftMonth = useCallback(
    (delta: number) => {
      updateViewWith((cur) => {
        const target = addMonths(new Date(cur.year, cur.month, 1), delta);
        return { month: target.getMonth(), year: target.getFullYear() };
      });
    },
    [updateViewWith],
  );

  const nextMonth = useCallback(() => shiftMonth(1), [shiftMonth]);
  const prevMonth = useCallback(() => shiftMonth(-1), [shiftMonth]);

  const setMonth = useCallback(
    (month: number) => updateViewWith((cur) => ({ month, year: cur.year })),
    [updateViewWith],
  );

  const setYear = useCallback(
    (year: number) => updateViewWith((cur) => ({ month: cur.month, year })),
    [updateViewWith],
  );

  /** ISO 8601 week number. */
  const getWeekNumber = useCallback((date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const diff = (d.getTime() - yearStart.getTime()) / 86400000;
    return Math.ceil((diff + 1) / 7);
  }, []);

  return {
    selected,
    month: viewMonth,
    year: viewYear,
    days,
    getDaysFor,
    getMonthYearAt,
    setMonth,
    setYear,
    nextMonth,
    prevMonth,
    shiftMonth,
    getDayProps,
    isSelected,
    isInRange,
    isDisabled,
    isToday,
    getModifiers,
    getWeekNumber,
    hoverDate,
    setHoverDate,
    weekStartsOn,
    locale: locale ?? "en-US",
  };
}
