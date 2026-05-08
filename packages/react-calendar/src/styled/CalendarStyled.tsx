import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { useCalendar } from "../useCalendar";
import type {
  CalendarMode,
  CalendarView,
  CalendarValue,
  FirstDayOfWeek,
  DayCell,
  WeekRow,
} from "../useCalendar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CalendarSize = "sm" | "md" | "lg";

export interface CalendarStyledProps {
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
  size?: CalendarSize;
  className?: string;
  style?: CSSProperties;
  markedDates?: { date: Date; color?: string }[];
  showTodayButton?: boolean;
  numberOfMonths?: number;
  renderDay?: (
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    isSelected: boolean,
  ) => ReactNode;
}

// ---------------------------------------------------------------------------
// CalendarStyled
// ---------------------------------------------------------------------------

export const CalendarStyled = forwardRef<HTMLDivElement, CalendarStyledProps>(
  function CalendarStyled(
    {
      value,
      defaultValue,
      onChange,
      mode = "single",
      view: controlledView,
      defaultView = "month",
      month,
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
      size = "md",
      className,
      style,
      markedDates,
      showTodayButton = false,
      numberOfMonths = 1,
      renderDay,
    },
    ref,
  ) {
    const {
      viewMonth,
      viewMonths,
      setViewMonth,
      view,
      setView,
      goToPrev,
      goToNext,
      goToToday,
      allMonthsWeeks,
      weekDayLabels,
      navProps,
      getDateProps,
      setHoverDate,
      yearMonths,
      decadeYears,
      announcement,
      liveRegionId,
    } = useCalendar({
      value,
      defaultValue,
      onChange,
      mode,
      view: controlledView,
      defaultView,
      month,
      defaultMonth,
      onMonthChange,
      minDate,
      maxDate,
      disabledDates,
      disabledDays,
      firstDayOfWeek,
      locale,
      showOutsideDays,
      showWeekNumbers,
      fixedWeeks,
      markedDates,
      numberOfMonths,
    });

    // Animation state for month transitions
    const [animClass, setAnimClass] = useState<"" | "rcal-slide-left" | "rcal-slide-right">("");
    const [animKey, setAnimKey] = useState(0);
    const prevMonthRef = useRef(viewMonth);

    useEffect(() => {
      if (
        prevMonthRef.current.getFullYear() === viewMonth.getFullYear() &&
        prevMonthRef.current.getMonth() === viewMonth.getMonth()
      ) {
        return;
      }
      const isForward =
        viewMonth > prevMonthRef.current;
      setAnimClass(isForward ? "rcal-slide-left" : "rcal-slide-right");
      setAnimKey((k) => k + 1);
      prevMonthRef.current = viewMonth;

      const timer = setTimeout(() => setAnimClass(""), 260);
      return () => clearTimeout(timer);
    }, [viewMonth]);

    // Focus management — imperatively focus the focused date button when it changes
    const gridRef = useRef<HTMLTableElement>(null);

    const handleDayCellRef = useCallback(
      (el: HTMLButtonElement | null, isFocused: boolean) => {
        if (el && isFocused) {
          // Defer to avoid focus during render
          requestAnimationFrame(() => el.focus({ preventScroll: true }));
        }
      },
      [],
    );

    const headerLabel = (() => {
      if (view === "month") {
        return viewMonth.toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
        });
      } else if (view === "year") {
        return String(viewMonth.getFullYear());
      } else {
        const start = Math.floor(viewMonth.getFullYear() / 10) * 10;
        return `${start}–${start + 9}`;
      }
    })();

    return (
      <div
        ref={ref}
        className={["rcal-root", className].filter(Boolean).join(" ")}
        data-mode={mode}
        data-view={view}
        data-size={size}
        style={style}
      >
        {/* Live region for accessibility announcements */}
        <div
          id={liveRegionId}
          aria-live="polite"
          aria-atomic="true"
          className="rcal-live"
        >
          {announcement}
        </div>

        {/* Header / navigation */}
        <div className="rcal-header">
          <button
            type="button"
            className="rcal-nav-btn rcal-nav-prev"
            onClick={goToPrev}
            aria-label={navProps.prevProps["aria-label"]}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
              width="1em"
              height="1em"
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
          </button>

          <button
            type="button"
            className="rcal-header-label"
            onClick={navProps.headerProps.onClick}
            aria-label={navProps.headerProps["aria-label"]}
          >
            {headerLabel}
          </button>

          {showTodayButton && (
            <button
              type="button"
              className="rcal-today-btn"
              onClick={goToToday}
              aria-label={navProps.todayProps["aria-label"]}
            >
              Today
            </button>
          )}

          <button
            type="button"
            className="rcal-nav-btn rcal-nav-next"
            onClick={goToNext}
            aria-label={navProps.nextProps["aria-label"]}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
              width="1em"
              height="1em"
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>

        {/* Month view */}
        {view === "month" && (
          numberOfMonths > 1 ? (
            <div className={`rcal-multi ${animClass}`} key={animKey}>
              {allMonthsWeeks.map((monthWeeks, mi) => (
                <MonthGrid
                  key={mi}
                  weeks={monthWeeks}
                  monthDate={viewMonths[mi]!}
                  locale={locale}
                  showWeekNumbers={showWeekNumbers}
                  showOutsideDays={showOutsideDays}
                  weekDayLabels={weekDayLabels}
                  gridRef={mi === 0 ? gridRef : undefined}
                  mode={mode}
                  getDateProps={getDateProps}
                  setHoverDate={setHoverDate}
                  handleDayCellRef={handleDayCellRef}
                  renderDay={renderDay}
                  showMonthLabel
                />
              ))}
            </div>
          ) : (
            <div className={`rcal-grid-wrapper ${animClass}`} key={animKey}>
              <MonthGrid
                weeks={allMonthsWeeks[0] ?? []}
                monthDate={viewMonths[0]!}
                locale={locale}
                showWeekNumbers={showWeekNumbers}
                showOutsideDays={showOutsideDays}
                weekDayLabels={weekDayLabels}
                gridRef={gridRef}
                mode={mode}
                getDateProps={getDateProps}
                setHoverDate={setHoverDate}
                handleDayCellRef={handleDayCellRef}
                renderDay={renderDay}
                showMonthLabel={false}
              />
            </div>
          )
        )}

        {/* Year view: 12 months */}
        {view === "year" && (
          <div className="rcal-year-grid">
            {yearMonths.map((m) => (
              <button
                key={m.date.getMonth()}
                type="button"
                className="rcal-year-month-btn"
                data-selected={m.isSelected ? "" : undefined}
                onClick={() => {
                  setViewMonth(m.date);
                  setView("month");
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Decade view: 10–12 years */}
        {view === "decade" && (
          <div className="rcal-decade-grid">
            {decadeYears.map((y) => {
              const decadeStart = Math.floor(viewMonth.getFullYear() / 10) * 10;
              const isOutside = y.year < decadeStart || y.year > decadeStart + 9;
              return (
                <button
                  key={y.year}
                  type="button"
                  className="rcal-decade-year-btn"
                  data-selected={y.isSelected ? "" : undefined}
                  data-outside-decade={isOutside ? "" : undefined}
                  onClick={() => {
                    setViewMonth(new Date(y.year, viewMonth.getMonth(), 1));
                    setView("year");
                  }}
                >
                  {y.year}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// MonthGrid sub-component
// ---------------------------------------------------------------------------

interface MonthGridProps {
  weeks: WeekRow[];
  monthDate: Date;
  locale: string | undefined;
  showWeekNumbers: boolean;
  showOutsideDays: boolean;
  weekDayLabels: string[];
  gridRef?: RefObject<HTMLTableElement>;
  mode: CalendarMode;
  getDateProps: (cell: DayCell) => ReturnType<ReturnType<typeof useCalendar>["getDateProps"]>;
  setHoverDate: (date: Date | null) => void;
  handleDayCellRef: (el: HTMLButtonElement | null, isFocused: boolean) => void;
  renderDay?: (
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    isSelected: boolean,
  ) => ReactNode;
  showMonthLabel: boolean;
}

function MonthGrid({
  weeks,
  monthDate,
  locale,
  showWeekNumbers,
  showOutsideDays,
  weekDayLabels,
  gridRef,
  mode,
  getDateProps,
  setHoverDate,
  handleDayCellRef,
  renderDay,
  showMonthLabel,
}: MonthGridProps) {
  const label = monthDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
  return (
    <div className="rcal-month-grid">
      {showMonthLabel && (
        <div className="rcal-month-label" aria-hidden="true">
          {label}
        </div>
      )}
      <table
        ref={gridRef}
        role="grid"
        aria-label={label}
        className="rcal-grid"
      >
        <thead>
          <tr className="rcal-weekdays">
            {showWeekNumbers && (
              <th
                scope="col"
                className="rcal-week-number-header"
                aria-label="Week"
              >
                W
              </th>
            )}
            {weekDayLabels.map((lbl) => (
              <th
                key={lbl}
                scope="col"
                role="columnheader"
                className="rcal-weekday"
                abbr={lbl}
              >
                {lbl.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi} className="rcal-week">
              {showWeekNumbers && (
                <td className="rcal-week-number" aria-label={`Week ${week[0]?.weekNumber ?? wi + 1}`}>
                  {week[0]?.weekNumber ?? wi + 1}
                </td>
              )}
              {week.map((cell, di) => (
                <td key={di} className="rcal-day-cell">
                  {(showOutsideDays || cell.isCurrentMonth) && (
                    <DayButton
                      cell={cell}
                      getDateProps={getDateProps}
                      mode={mode}
                      onMouseEnter={() => {
                        if (mode === "range") setHoverDate(cell.date);
                      }}
                      onMouseLeave={() => {
                        if (mode === "range") setHoverDate(null);
                      }}
                      focusRef={handleDayCellRef}
                      renderDay={renderDay}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DayButton sub-component
// ---------------------------------------------------------------------------

interface DayButtonProps {
  cell: DayCell;
  getDateProps: (cell: DayCell) => ReturnType<ReturnType<typeof useCalendar>["getDateProps"]>;
  mode: CalendarMode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  focusRef: (el: HTMLButtonElement | null, isFocused: boolean) => void;
  renderDay?: (
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    isSelected: boolean,
  ) => ReactNode;
}

function DayButton({
  cell,
  getDateProps,
  onMouseEnter,
  onMouseLeave,
  focusRef,
  renderDay,
}: DayButtonProps) {
  const props = getDateProps(cell);

  return (
    <button
      ref={(el) => focusRef(el, cell.isFocused)}
      type="button"
      className="rcal-day"
      role={props.role}
      aria-selected={props["aria-selected"]}
      aria-disabled={props["aria-disabled"]}
      aria-current={props["aria-current"]}
      data-selected={props["data-selected"]}
      data-today={props["data-today"]}
      data-outside-month={props["data-outside-month"]}
      data-in-range={props["data-in-range"]}
      data-range-start={props["data-range-start"]}
      data-range-end={props["data-range-end"]}
      data-disabled={props["data-disabled"]}
      data-focused={props["data-focused"]}
      tabIndex={props.tabIndex}
      disabled={cell.isDisabled}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {renderDay ? (
        renderDay(cell.date, cell.isCurrentMonth, cell.isToday, cell.isSelected)
      ) : (
        <>
          <span className="rcal-day-label" aria-hidden="true">
            {cell.date.getDate()}
          </span>
          <span className="rcal-sr-only">
            {cell.date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {cell.isMarked && (
            <span
              className="rcal-day-dot"
              aria-hidden="true"
              style={cell.markColor ? { background: cell.markColor } : undefined}
            />
          )}
        </>
      )}
    </button>
  );
}
