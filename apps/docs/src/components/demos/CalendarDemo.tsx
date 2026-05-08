import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { CalendarStyled } from "@mshafiqyajid/react-calendar/styled";
import "@mshafiqyajid/react-calendar/styles.css";
import type { CalendarValue, CalendarMode, FirstDayOfWeek } from "@mshafiqyajid/react-calendar";

function getMarkedDates() {
  const today = new Date();
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };
  return [
    { date: today, color: "#6366f1" },
    { date: addDays(today, 3), color: "#f59e0b" },
    { date: addDays(today, 7), color: "#10b981" },
  ];
}

function CalendarWrapper({
  mode,
  size,
  showOutsideDays,
  showWeekNumbers,
  fixedWeeks,
  firstDayOfWeek,
  showTodayButton,
  numberOfMonths,
  useMarkedDates,
}: {
  mode: CalendarMode;
  size: "sm" | "md" | "lg";
  showOutsideDays: boolean;
  showWeekNumbers: boolean;
  fixedWeeks: boolean;
  firstDayOfWeek: FirstDayOfWeek | number;
  showTodayButton: boolean;
  numberOfMonths: number;
  useMarkedDates: boolean;
}) {
  const [value, setValue] = useState<CalendarValue>(
    mode === "range" ? [null, null] : mode === "multiple" ? [] : null,
  );

  const handleChange = (v: CalendarValue) => setValue(v);

  const formatValue = () => {
    if (mode === "single") {
      const v = value as Date | null;
      return v ? v.toLocaleDateString(undefined, { dateStyle: "medium" }) : "No date selected";
    }
    if (mode === "range") {
      const [s, e] = value as [Date | null, Date | null];
      const fmt = (d: Date | null) =>
        d ? d.toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";
      return `${fmt(s)} → ${fmt(e)}`;
    }
    if (mode === "multiple") {
      const mv = value as Date[];
      if (mv.length === 0) return "No dates selected";
      return `${mv.length} date${mv.length !== 1 ? "s" : ""} selected`;
    }
    return "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <CalendarStyled
        mode={mode}
        size={size}
        value={value}
        onChange={handleChange}
        showOutsideDays={showOutsideDays}
        showWeekNumbers={showWeekNumbers}
        fixedWeeks={fixedWeeks}
        firstDayOfWeek={firstDayOfWeek as FirstDayOfWeek}
        showTodayButton={showTodayButton}
        numberOfMonths={numberOfMonths}
        markedDates={useMarkedDates ? getMarkedDates() : undefined}
      />
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--fg-subtle, #71717a)",
          margin: 0,
          fontFamily: "monospace",
        }}
      >
        {formatValue()}
      </p>
    </div>
  );
}

export default function CalendarDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="CalendarStyled"
      importLine={`import { CalendarStyled } from "@mshafiqyajid/react-calendar/styled";\nimport "@mshafiqyajid/react-calendar/styles.css";`}
      props={[
        {
          name: "mode",
          group: "Mode",
          control: { type: "select", options: ["single", "range", "multiple"] },
          defaultValue: "single",
          omitWhen: "single",
        },
        {
          name: "size",
          group: "Appearance",
          control: { type: "select", options: ["sm", "md", "lg"] },
          defaultValue: "md",
          omitWhen: "md",
        },
        {
          name: "firstDayOfWeek",
          group: "Appearance",
          label: "first day",
          control: { type: "select", options: ["0", "1", "6"] },
          defaultValue: "0",
          omitWhen: "0",
        },
        /* ── Grid ── */
        { name: "showOutsideDays", group: "Grid", label: "outside days",
          control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showWeekNumbers", group: "Grid", label: "week numbers",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "fixedWeeks",      group: "Grid", label: "fixed weeks",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "showTodayButton", group: "Grid", label: "today button",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        /* ── Features ── */
        { name: "numberOfMonths",  group: "Features", label: "months shown",
          control: { type: "select", options: ["1", "2", "3"] },
          defaultValue: "1", omitWhen: "1" },
        { name: "useMarkedDates",  group: "Features", label: "mark dates",
          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      render={(v) => (
        // key on CalendarWrapper forces full remount (including value state) when
        // mode or firstDayOfWeek changes — prevents type mismatch between value and mode
        <CalendarWrapper
          key={`${v.mode}-${v.firstDayOfWeek}`}
          mode={v.mode as CalendarMode}
          size={v.size as "sm" | "md" | "lg"}
          showOutsideDays={v.showOutsideDays as boolean}
          showWeekNumbers={v.showWeekNumbers as boolean}
          fixedWeeks={v.fixedWeeks as boolean}
          firstDayOfWeek={Number(v.firstDayOfWeek) as FirstDayOfWeek}
          showTodayButton={v.showTodayButton as boolean}
          numberOfMonths={Number(v.numberOfMonths)}
          useMarkedDates={v.useMarkedDates as boolean}
        />
      )}
    />
  );
}
