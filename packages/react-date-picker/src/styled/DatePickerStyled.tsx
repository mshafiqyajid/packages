import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useDatePicker } from "../useDatePicker";
import type { DatePickerMode, RangeValue } from "../useDatePicker";
import { formatDate } from "../dateUtils";

export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerTone = "neutral" | "primary";

export interface DatePickerStyledProps {
  value?: Date | RangeValue | null;
  defaultValue?: Date | RangeValue | null;
  onChange?: (value: Date | RangeValue | null) => void;
  mode?: DatePickerMode;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  format?: string;
  size?: DatePickerSize;
  tone?: DatePickerTone;
  className?: string;
  disabledDates?: Date[] | ((date: Date) => boolean);
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  clearable?: boolean;
  onMonthChange?: (month: number, year: number) => void;
  onYearChange?: (year: number) => void;
}

function formatValue(
  value: Date | RangeValue | null | undefined,
  fmt: string,
  placeholder: string,
): string {
  if (!value) return placeholder;
  if (Array.isArray(value)) {
    return `${formatDate(value[0], fmt)} – ${formatDate(value[1], fmt)}`;
  }
  return formatDate(value, fmt);
}

function getCalendarPosition(
  triggerRect: DOMRect,
): { top: number; left: number } {
  const GAP = 6;
  const top = triggerRect.bottom + window.scrollY + GAP;
  let left = triggerRect.left + window.scrollX;
  const calendarWidth = 280;
  if (left + calendarWidth > window.innerWidth - 8) {
    left = Math.max(8, triggerRect.right + window.scrollX - calendarWidth);
  }
  return { top, left };
}

export const DatePickerStyled = forwardRef<HTMLDivElement, DatePickerStyledProps>(
  function DatePickerStyled(
    {
      value,
      defaultValue,
      onChange,
      mode = "single",
      minDate,
      maxDate,
      disabled = false,
      placeholder = "Select date",
      format = "MMM D, YYYY",
      size = "md",
      tone = "neutral",
      className,
      disabledDates,
      weekStartsOn = 0,
      locale,
      clearable = false,
      onMonthChange,
      onYearChange,
    },
    ref,
  ) {
    const triggerId = useId();
    const calendarId = useId();

    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<CSSProperties>({ top: -9999, left: -9999 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const focusedDateRef = useRef<Date | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const picker = useDatePicker({
      mode,
      value,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabled,
      disabledDates,
      weekStartsOn,
      locale,
    });

    // Locale-aware month name and day abbreviations
    const resolvedLocale = locale ?? "en-US";

    const monthName = useMemo(
      () =>
        new Intl.DateTimeFormat(resolvedLocale, { month: "long" }).format(
          new Date(picker.year, picker.month, 1),
        ),
      [resolvedLocale, picker.year, picker.month],
    );

    const dayAbbrs = useMemo(
      () =>
        Array.from({ length: 7 }, (_, i) => {
          // Jan 2 2000 is a Sunday (day 0); shift by weekStartsOn to rotate the row
          const d = new Date(2000, 0, 2 + ((i + weekStartsOn) % 7));
          return new Intl.DateTimeFormat(resolvedLocale, { weekday: "short" }).format(d);
        }),
      [resolvedLocale, weekStartsOn],
    );

    const updatePosition = useCallback(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const pos = getCalendarPosition(rect);
      setCoords({ top: pos.top, left: pos.left });
    }, []);

    const openCalendar = useCallback(() => {
      if (disabled) return;
      updatePosition();
      setOpen(true);
    }, [disabled, updatePosition]);

    const closeCalendar = useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, []);

    useEffect(() => {
      if (!open) return;
      const onKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") closeCalendar();
      };
      const onClickOutside = (e: MouseEvent) => {
        if (
          calendarRef.current &&
          !calendarRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          closeCalendar();
        }
      };
      const onScroll = () => updatePosition();
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onClickOutside);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("mousedown", onClickOutside);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [open, closeCalendar, updatePosition]);

    const handleTriggerKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openCalendar();
      }
    }, [openCalendar]);

    const moveFocus = useCallback((delta: number) => {
      const buttons = calendarRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-rdp-day]:not([tabindex='-1'])",
      );
      if (!buttons || buttons.length === 0) return;
      const arr = Array.from(buttons);
      const focused = document.activeElement;
      const idx = arr.indexOf(focused as HTMLButtonElement);
      const next = idx === -1 ? 0 : Math.max(0, Math.min(arr.length - 1, idx + delta));
      arr[next]?.focus();
    }, []);

    const handleCalendarKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          moveFocus(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveFocus(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveFocus(7);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveFocus(-7);
          break;
        case "Escape":
          e.preventDefault();
          closeCalendar();
          break;
      }
    }, [moveFocus, closeCalendar]);

    const handlePrevMonth = useCallback(() => {
      picker.prevMonth();
      // After prevMonth the view state hasn't re-rendered yet; compute the
      // previous month values manually so callbacks receive the right values.
      const prev = picker.month === 0
        ? { month: 11, year: picker.year - 1 }
        : { month: picker.month - 1, year: picker.year };
      onMonthChange?.(prev.month, prev.year);
    }, [picker, onMonthChange]);

    const handleNextMonth = useCallback(() => {
      picker.nextMonth();
      const next = picker.month === 11
        ? { month: 0, year: picker.year + 1 }
        : { month: picker.month + 1, year: picker.year };
      onMonthChange?.(next.month, next.year);
    }, [picker, onMonthChange]);

    const handleSetYear = useCallback((year: number) => {
      picker.setYear(year);
      onYearChange?.(year);
    }, [picker, onYearChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    }, [onChange]);

    const displayValue = formatValue(
      value !== undefined ? value : picker.selected,
      format,
      placeholder,
    );

    const hasValue = !!(value !== undefined ? value : picker.selected);

    const calendarStyle: CSSProperties = {
      position: "absolute",
      ...coords,
      zIndex: 9999,
    };

    return (
      <div
        ref={ref}
        className={["rdp-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
      >
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className="rdp-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={calendarId}
          disabled={disabled}
          data-placeholder={!hasValue ? "true" : undefined}
          onClick={openCalendar}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="rdp-trigger-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M1 6h14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="rdp-trigger-text">{displayValue}</span>
          {clearable && hasValue && (
            <button
              type="button"
              className="rdp-clear-btn"
              aria-label="Clear"
              onClick={handleClear}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </button>

        {mounted && open && createPortal(
          <div
            ref={calendarRef}
            id={calendarId}
            role="dialog"
            aria-modal="true"
            aria-label="Date picker"
            aria-labelledby={triggerId}
            className="rdp-calendar"
            data-size={size}
            data-tone={tone}
            style={calendarStyle}
            onKeyDown={handleCalendarKeyDown}
          >
            <div className="rdp-header">
              <button
                type="button"
                className="rdp-nav-btn"
                aria-label="Previous month"
                onClick={handlePrevMonth}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="rdp-month-year">
                <span className="rdp-month-label">
                  {monthName}
                </span>
                <span
                  className="rdp-year-label"
                  onClick={() => handleSetYear(picker.year)}
                >
                  {picker.year}
                </span>
              </div>

              <button
                type="button"
                className="rdp-nav-btn"
                aria-label="Next month"
                onClick={handleNextMonth}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="rdp-weekdays" role="row">
              {dayAbbrs.map((d) => (
                <abbr key={d} className="rdp-weekday" title={d} aria-label={d}>
                  {d.slice(0, 2)}
                </abbr>
              ))}
            </div>

            <div className="rdp-grid" role="grid" aria-label={`${monthName} ${picker.year}`}>
              {picker.days.map((date) => {
                const dayProps = picker.getDayProps(date);
                const isOutside = dayProps["data-outside-month"];
                const isSel = dayProps["data-selected"];
                const inRange = dayProps["data-in-range"];
                const isStart = dayProps["data-range-start"];
                const isEnd = dayProps["data-range-end"];
                const isDis = dayProps["data-disabled"];
                const isT = dayProps["data-today"];

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    className="rdp-day"
                    data-rdp-day="true"
                    data-outside-month={isOutside ? "true" : undefined}
                    data-selected={isSel ? "true" : undefined}
                    data-today={isT ? "true" : undefined}
                    data-in-range={inRange ? "true" : undefined}
                    data-range-start={isStart ? "true" : undefined}
                    data-range-end={isEnd ? "true" : undefined}
                    data-disabled={isDis ? "true" : undefined}
                    aria-selected={dayProps["aria-selected"]}
                    aria-disabled={dayProps["aria-disabled"]}
                    aria-label={formatDate(date, "MMMM D, YYYY")}
                    tabIndex={isDis || isOutside ? -1 : 0}
                    disabled={isDis}
                    onClick={() => {
                      dayProps.onClick();
                      if (mode === "single") {
                        closeCalendar();
                      }
                    }}
                    onKeyDown={dayProps.onKeyDown}
                    onMouseEnter={() => picker.setHoverDate(date)}
                    onMouseLeave={() => picker.setHoverDate(null)}
                    ref={isSel ? (el) => { focusedDateRef.current = date; if (el && open) el.focus(); } : undefined}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
      </div>
    );
  },
);
