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
}

export interface UseDatePickerReturn {
  selected: Date | RangeValue | null;
  month: number;
  year: number;
  days: Date[];
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  getDayProps: (date: Date) => DayProps;
  isSelected: (date: Date) => boolean;
  isInRange: (date: Date) => boolean;
  isDisabled: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  hoverDate: Date | null;
  setHoverDate: (date: Date | null) => void;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale: string;
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
  } = options;

  const isControlled = value !== undefined;

  const resolveInitial = (): Date | RangeValue | null => {
    const init = isControlled ? value : (defaultValue ?? null);
    return init ?? null;
  };

  const [internalSelected, setInternalSelected] = useState<Date | RangeValue | null>(resolveInitial);
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = useMemo(() => new Date(), []);

  const initDate: Date = (() => {
    const s = isControlled ? value : internalSelected;
    if (s === null || s === undefined) return today;
    if (Array.isArray(s)) return s[0];
    return s as Date;
  })();

  const [viewMonth, setViewMonth] = useState<number>(initDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(initDate.getFullYear());

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

  const days = useMemo(
    () => getCalendarDays(viewYear, viewMonth, weekStartsOn),
    [viewYear, viewMonth, weekStartsOn],
  );

  const getDayProps = useCallback(
    (date: Date): DayProps => {
      const sel = isSelected(date);
      const inRange = isInRange(date);
      const dis = isDisabled(date);
      const outsideMonth = date.getMonth() !== viewMonth;

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
      };
    },
    [isSelected, isInRange, isDisabled, isToday, handleDayClick, handleKeyDown, viewMonth, mode, selected, rangeAnchor],
  );

  const nextMonth = useCallback(() => {
    const next = addMonths(new Date(viewYear, viewMonth, 1), 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  }, [viewMonth, viewYear]);

  const prevMonth = useCallback(() => {
    const prev = addMonths(new Date(viewYear, viewMonth, 1), -1);
    setViewMonth(prev.getMonth());
    setViewYear(prev.getFullYear());
  }, [viewMonth, viewYear]);

  const setMonth = useCallback((month: number) => {
    setViewMonth(month);
  }, []);

  const setYear = useCallback((year: number) => {
    setViewYear(year);
  }, []);

  return {
    selected,
    month: viewMonth,
    year: viewYear,
    days,
    setMonth,
    setYear,
    nextMonth,
    prevMonth,
    getDayProps,
    isSelected,
    isInRange,
    isDisabled,
    isToday,
    hoverDate,
    setHoverDate,
    weekStartsOn,
    locale: locale ?? "en-US",
  };
}
