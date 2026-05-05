import {
  forwardRef,
  Fragment,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  type KeyboardEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useDatePicker } from "../useDatePicker";
import type {
  DatePickerMode,
  RangeValue,
  MonthYear,
  DateModifiers,
} from "../useDatePicker";
import { formatDate } from "../dateUtils";

export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerTone = "neutral" | "primary";
export type DatePickerPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
export type DatePickerStrategy = "absolute" | "fixed";
export type DatePickerCaptionLayout =
  | "label"
  | "dropdown"
  | "dropdown-months"
  | "dropdown-years";

export interface RenderDayContext {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isOutsideMonth: boolean;
  modifiers: string[];
}

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

  /** Visible-month controlled view. */
  month?: MonthYear;
  /** Visible-month default (uncontrolled). */
  defaultMonth?: MonthYear;

  /** Number of month grids shown side-by-side in the popover. Default 1. */
  numberOfMonths?: 1 | 2 | 3;
  /** Chevron paging step. "all" advances by `numberOfMonths`. Default 1. */
  pagedBy?: 1 | "all";

  /** Replace day cell content. The button shell + a11y stay owned by the component. */
  renderDay?: (ctx: RenderDayContext) => ReactNode;

  /** Header layout — chevron-only label, native dropdowns, or split dropdowns. */
  captionLayout?: DatePickerCaptionLayout;
  /** Earliest year for the year dropdown. Default current - 100. */
  fromYear?: number;
  /** Latest year for the year dropdown. Default current + 10. */
  toYear?: number;

  /** Render the calendar always-visible without a trigger. */
  inline?: boolean;
  /** Controlled open state for the popover variant. */
  open?: boolean;
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Fires when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** Tag dates with arbitrary modifier names. Each match emits `data-mod-<name>` on the day cell. */
  modifiers?: DateModifiers;
  /** Hide trailing/leading outside-month days. Default true. */
  showOutsideDays?: boolean;
  /** Pad the grid to 6 weeks regardless of month. Default true. */
  fixedWeeks?: boolean;

  /** Skip disabled cells when navigating with arrow keys. Default true. */
  skipDisabledOnArrowKey?: boolean;
  /** Auto-close after selection. Default: true for single, false for range. */
  closeOnSelect?: boolean;
  /** Re-clicking the currently selected date clears it. Default false. */
  clearOnReselect?: boolean;

  /** Customize the live-region announcement when the visible month changes. */
  monthChangeAnnouncement?: (month: string, year: number) => string;

  onDayMouseEnter?: (date: Date, e: React.MouseEvent) => void;
  onDayMouseLeave?: (date: Date, e: React.MouseEvent) => void;
  onDayFocus?: (date: Date) => void;

  // Floating-UI positioning
  placement?: DatePickerPlacement;
  offset?: number;
  collisionPadding?: number;
  flip?: boolean;
  shift?: boolean;
  strategy?: DatePickerStrategy;
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

interface ComputeOpts {
  trigger: DOMRect;
  floating: DOMRect;
  placement: DatePickerPlacement;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: DatePickerStrategy;
}

function computePosition({
  trigger,
  floating,
  placement,
  offset,
  collisionPadding,
  flip,
  shift,
  strategy,
}: ComputeOpts): { top: number; left: number; placement: DatePickerPlacement } {
  const dash = placement.indexOf("-");
  let side = placement.slice(0, dash) as "top" | "bottom";
  const align = placement.slice(dash + 1) as "start" | "end";
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (flip) {
    if (
      side === "bottom" &&
      vh - trigger.bottom < floating.height + offset + collisionPadding &&
      trigger.top >= floating.height + offset + collisionPadding
    ) {
      side = "top";
    } else if (
      side === "top" &&
      trigger.top < floating.height + offset + collisionPadding &&
      vh - trigger.bottom >= floating.height + offset + collisionPadding
    ) {
      side = "bottom";
    }
  }

  let top = side === "top" ? trigger.top - floating.height - offset : trigger.bottom + offset;
  let left = align === "start" ? trigger.left : trigger.right - floating.width;

  if (shift) {
    const min = collisionPadding;
    const max = vw - floating.width - collisionPadding;
    if (max >= min) left = Math.max(min, Math.min(left, max));
  }

  return {
    top: top + sy,
    left: left + sx,
    placement: `${side}-${align}` as DatePickerPlacement,
  };
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
      month,
      defaultMonth,
      numberOfMonths = 1,
      pagedBy = 1,
      renderDay,
      captionLayout = "label",
      fromYear,
      toYear,
      inline = false,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      modifiers,
      showOutsideDays = true,
      fixedWeeks = true,
      skipDisabledOnArrowKey = true,
      closeOnSelect,
      clearOnReselect = false,
      monthChangeAnnouncement,
      onDayMouseEnter,
      onDayMouseLeave,
      onDayFocus,
      placement = "bottom-start",
      offset = 6,
      collisionPadding = 8,
      flip = true,
      shift = true,
      strategy = "absolute",
    },
    ref,
  ) {
    const triggerId = useId();
    const calendarId = useId();

    const isOpenControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = inline ? true : isOpenControlled ? controlledOpen! : internalOpen;
    const setOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({
      top: -9999,
      left: -9999,
    });
    const [resolvedPlacement, setResolvedPlacement] = useState<DatePickerPlacement>(placement);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

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
      month,
      defaultMonth,
      onMonthChange,
      modifiers,
      fixedWeeks,
    });

    const resolvedLocale = locale ?? "en-US";

    const dayAbbrs = useMemo(
      () =>
        Array.from({ length: 7 }, (_, i) => {
          // Jan 2 2000 is a Sunday (day 0); shift by weekStartsOn to rotate the row
          const d = new Date(2000, 0, 2 + ((i + weekStartsOn) % 7));
          return new Intl.DateTimeFormat(resolvedLocale, { weekday: "short" }).format(d);
        }),
      [resolvedLocale, weekStartsOn],
    );

    const monthFormatter = useMemo(
      () => new Intl.DateTimeFormat(resolvedLocale, { month: "long" }),
      [resolvedLocale],
    );

    const monthOptions = useMemo(
      () =>
        Array.from({ length: 12 }, (_, m) => ({
          value: m,
          label: monthFormatter.format(new Date(2000, m, 1)),
        })),
      [monthFormatter],
    );

    const currentYear = new Date().getFullYear();
    const yearStart = fromYear ?? currentYear - 100;
    const yearEnd = toYear ?? currentYear + 10;
    const yearOptions = useMemo(() => {
      const out: number[] = [];
      for (let y = yearStart; y <= yearEnd; y++) out.push(y);
      return out;
    }, [yearStart, yearEnd]);

    const updatePosition = useCallback(() => {
      if (inline || !triggerRef.current || !calendarRef.current) return;
      const pos = computePosition({
        trigger: triggerRef.current.getBoundingClientRect(),
        floating: calendarRef.current.getBoundingClientRect(),
        placement,
        offset,
        collisionPadding,
        flip,
        shift,
        strategy,
      });
      setCoords({ top: pos.top, left: pos.left });
      setResolvedPlacement(pos.placement);
    }, [inline, placement, offset, collisionPadding, flip, shift, strategy]);

    const openCalendar = useCallback(() => {
      if (disabled) return;
      setOpen(true);
    }, [disabled, setOpen]);

    const closeCalendar = useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, [setOpen]);

    useEffect(() => {
      if (!open || inline) return;
      // After paint, calendar has real dimensions for accurate flip.
      requestAnimationFrame(() => updatePosition());
    }, [open, inline, updatePosition]);

    useEffect(() => {
      if (!open || inline) return;
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
    }, [open, inline, closeCalendar, updatePosition]);

    const handleTriggerKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          openCalendar();
        }
      },
      [openCalendar],
    );

    const moveFocus = useCallback(
      (delta: number) => {
        if (!calendarRef.current) return;
        const selector = skipDisabledOnArrowKey
          ? "button[data-rdp-day]:not([data-disabled='true']):not([tabindex='-1'])"
          : "button[data-rdp-day]:not([tabindex='-1'])";
        const buttons = calendarRef.current.querySelectorAll<HTMLButtonElement>(selector);
        if (buttons.length === 0) return;
        const arr = Array.from(buttons);
        const focused = document.activeElement;
        const idx = arr.indexOf(focused as HTMLButtonElement);
        const next = idx === -1 ? 0 : Math.max(0, Math.min(arr.length - 1, idx + delta));
        arr[next]?.focus();
      },
      [skipDisabledOnArrowKey],
    );

    const handleCalendarKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
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
            if (!inline) {
              e.preventDefault();
              closeCalendar();
            }
            break;
        }
      },
      [moveFocus, closeCalendar, inline],
    );

    const pageStep = pagedBy === "all" ? numberOfMonths : 1;

    const handlePrevMonth = useCallback(() => {
      picker.shiftMonth(-pageStep);
    }, [picker, pageStep]);

    const handleNextMonth = useCallback(() => {
      picker.shiftMonth(pageStep);
    }, [picker, pageStep]);

    const handleSetYear = useCallback(
      (year: number) => {
        picker.setYear(year);
        onYearChange?.(year);
      },
      [picker, onYearChange],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(null);
      },
      [onChange],
    );

    const handleDayClick = useCallback(
      (_date: Date, dayProps: ReturnType<typeof picker.getDayProps>) => {
        const wasSelected = dayProps["data-selected"];
        if (clearOnReselect && wasSelected && mode === "single") {
          onChange?.(null);
          return;
        }
        dayProps.onClick();
        const shouldClose =
          closeOnSelect ?? (mode === "single" ? true : false);
        if (shouldClose && !inline) {
          closeCalendar();
        }
      },
      [clearOnReselect, mode, onChange, closeOnSelect, inline, closeCalendar],
    );

    const displayValue = formatValue(
      value !== undefined ? value : picker.selected,
      format,
      placeholder,
    );

    const hasValue = !!(value !== undefined ? value : picker.selected);

    const calendarStyle: CSSProperties = inline
      ? {}
      : {
          position: strategy,
          top: coords.top,
          left: coords.left,
          zIndex: 9999,
        };

    // Live region announcement
    const announcement = useMemo(() => {
      const monthName = monthFormatter.format(new Date(picker.year, picker.month, 1));
      if (monthChangeAnnouncement) return monthChangeAnnouncement(monthName, picker.year);
      return `${monthName} ${picker.year}`;
    }, [monthFormatter, picker.year, picker.month, monthChangeAnnouncement]);

    const renderMonthGrid = (monthOffset: number) => {
      const my = picker.getMonthYearAt(monthOffset);
      const days = picker.getDaysFor(monthOffset);
      const monthName = monthFormatter.format(new Date(my.year, my.month, 1));

      return (
        <div className="rdp-month" key={`${my.year}-${my.month}`} data-month-offset={monthOffset}>
          <div className="rdp-header">
            {monthOffset === 0 && (
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
            )}

            <div className="rdp-month-year">
              {(captionLayout === "dropdown" || captionLayout === "dropdown-months") ? (
                <select
                  className="rdp-month-select"
                  aria-label="Month"
                  value={my.month}
                  onChange={(e) => {
                    const target = Number(e.target.value);
                    if (monthOffset === 0) picker.setMonth(target);
                    else picker.shiftMonth(target - my.month);
                  }}
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="rdp-month-label">{monthName}</span>
              )}
              {(captionLayout === "dropdown" || captionLayout === "dropdown-years") ? (
                <select
                  className="rdp-year-select"
                  aria-label="Year"
                  value={my.year}
                  onChange={(e) => {
                    const target = Number(e.target.value);
                    if (monthOffset === 0) handleSetYear(target);
                    else picker.shiftMonth((target - my.year) * 12);
                  }}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className="rdp-year-label"
                  onClick={() => handleSetYear(my.year)}
                >
                  {my.year}
                </span>
              )}
            </div>

            {monthOffset === numberOfMonths - 1 && (
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
            )}
            {/* Spacer when nav is on a different month grid */}
            {monthOffset > 0 && monthOffset !== numberOfMonths - 1 && (
              <span className="rdp-nav-spacer" aria-hidden="true" />
            )}
            {numberOfMonths > 1 && monthOffset === 0 && (
              <span className="rdp-nav-spacer" aria-hidden="true" />
            )}
            {numberOfMonths > 1 && monthOffset === numberOfMonths - 1 && (
              <span
                className="rdp-nav-spacer"
                style={{ order: -1 }}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="rdp-weekdays" role="row">
            {dayAbbrs.map((d) => (
              <abbr key={d} className="rdp-weekday" title={d} aria-label={d}>
                {d.slice(0, 2)}
              </abbr>
            ))}
          </div>

          <div className="rdp-grid" role="grid" aria-label={`${monthName} ${my.year}`}>
            {days.map((date) => {
              const inThisMonth = date.getMonth() === my.month;
              if (!inThisMonth && !showOutsideDays) {
                return (
                  <span
                    key={date.toISOString()}
                    className="rdp-day-empty"
                    aria-hidden="true"
                  />
                );
              }
              // Reuse the hook's day props but override outside-month based on this grid's month.
              const dayProps = picker.getDayProps(date);
              const isOutside = date.getMonth() !== my.month;
              const isSel = dayProps["data-selected"];
              const inRange = dayProps["data-in-range"];
              const isStart = dayProps["data-range-start"];
              const isEnd = dayProps["data-range-end"];
              const isDis = dayProps["data-disabled"];
              const isT = dayProps["data-today"];
              const mods = dayProps["data-modifiers"];
              const modList = mods ? mods.split(" ").filter(Boolean) : [];

              const dayDataAttrs: Record<string, string> = {};
              for (const m of modList) dayDataAttrs[`data-mod-${m}`] = "true";

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
                  data-modifiers={mods || undefined}
                  {...dayDataAttrs}
                  aria-selected={dayProps["aria-selected"]}
                  aria-disabled={dayProps["aria-disabled"]}
                  aria-label={formatDate(date, "MMMM D, YYYY")}
                  tabIndex={isDis || isOutside ? -1 : 0}
                  disabled={isDis}
                  onClick={() => handleDayClick(date, dayProps)}
                  onKeyDown={dayProps.onKeyDown}
                  onMouseEnter={(e) => {
                    picker.setHoverDate(date);
                    onDayMouseEnter?.(date, e);
                  }}
                  onMouseLeave={(e) => {
                    picker.setHoverDate(null);
                    onDayMouseLeave?.(date, e);
                  }}
                  onFocus={() => onDayFocus?.(date)}
                >
                  {renderDay
                    ? renderDay({
                        date,
                        isToday: isT,
                        isSelected: isSel,
                        isInRange: inRange,
                        isDisabled: isDis,
                        isOutsideMonth: isOutside,
                        modifiers: modList,
                      })
                    : date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    const calendarBody = (
      <Fragment>
        <div
          className="rdp-months"
          data-count={numberOfMonths}
        >
          {Array.from({ length: numberOfMonths }, (_, i) => renderMonthGrid(i))}
        </div>
        <span className="rdp-sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </Fragment>
    );

    if (inline) {
      return (
        <div
          ref={ref}
          className={["rdp-root", "rdp-root-inline", className].filter(Boolean).join(" ")}
          data-size={size}
          data-tone={tone}
          data-disabled={disabled ? "true" : undefined}
          data-inline="true"
        >
          <div
            ref={calendarRef}
            id={calendarId}
            role="dialog"
            aria-label="Date picker"
            className="rdp-calendar rdp-calendar-inline"
            data-size={size}
            data-tone={tone}
            onKeyDown={handleCalendarKeyDown}
          >
            {calendarBody}
          </div>
        </div>
      );
    }

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

        {mounted &&
          open &&
          createPortal(
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
              data-placement={resolvedPlacement}
              style={calendarStyle}
              onKeyDown={handleCalendarKeyDown}
            >
              {calendarBody}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
