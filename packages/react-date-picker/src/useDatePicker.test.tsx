import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDatePicker } from "./useDatePicker";
import type { RangeValue } from "./useDatePicker";

describe("useDatePicker — single mode", () => {
  it("starts with null selection when no defaultValue given", () => {
    const { result } = renderHook(() => useDatePicker({ mode: "single" }));
    expect(result.current.selected).toBeNull();
  });

  it("uses defaultValue as initial selection", () => {
    const date = new Date(2025, 0, 15);
    const { result } = renderHook(() =>
      useDatePicker({ mode: "single", defaultValue: date }),
    );
    expect(result.current.selected).toEqual(date);
  });

  it("calls onChange and updates selected when a day is clicked", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDatePicker({ mode: "single", onChange }),
    );
    const date = new Date(2025, 3, 10);
    act(() => {
      result.current.getDayProps(date).onClick();
    });
    expect(result.current.selected).not.toBeNull();
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it("does not call onChange for a disabled date", () => {
    const onChange = vi.fn();
    const minDate = new Date(2025, 3, 15);
    const { result } = renderHook(() =>
      useDatePicker({ mode: "single", onChange, minDate }),
    );
    const disabledDate = new Date(2025, 3, 10);
    act(() => {
      result.current.getDayProps(disabledDate).onClick();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("isToday returns true for today", () => {
    const { result } = renderHook(() => useDatePicker());
    const today = new Date();
    expect(result.current.isToday(today)).toBe(true);
  });

  it("isToday returns false for a different date", () => {
    const { result } = renderHook(() => useDatePicker());
    const notToday = new Date(2020, 0, 1);
    expect(result.current.isToday(notToday)).toBe(false);
  });

  it("isDisabled returns true when date is before minDate", () => {
    const minDate = new Date(2025, 3, 15);
    const { result } = renderHook(() =>
      useDatePicker({ minDate }),
    );
    expect(result.current.isDisabled(new Date(2025, 3, 10))).toBe(true);
    expect(result.current.isDisabled(new Date(2025, 3, 15))).toBe(false);
    expect(result.current.isDisabled(new Date(2025, 3, 20))).toBe(false);
  });

  it("isDisabled returns true when date is after maxDate", () => {
    const maxDate = new Date(2025, 3, 20);
    const { result } = renderHook(() =>
      useDatePicker({ maxDate }),
    );
    expect(result.current.isDisabled(new Date(2025, 3, 25))).toBe(true);
    expect(result.current.isDisabled(new Date(2025, 3, 20))).toBe(false);
  });

  it("isDisabled returns true for all dates when disabled=true", () => {
    const { result } = renderHook(() => useDatePicker({ disabled: true }));
    expect(result.current.isDisabled(new Date())).toBe(true);
  });

  it("nextMonth advances the view month", () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultValue: new Date(2025, 0, 1) }),
    );
    expect(result.current.month).toBe(0);
    act(() => result.current.nextMonth());
    expect(result.current.month).toBe(1);
    expect(result.current.year).toBe(2025);
  });

  it("prevMonth goes back through year boundary", () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultValue: new Date(2025, 0, 1) }),
    );
    act(() => result.current.prevMonth());
    expect(result.current.month).toBe(11);
    expect(result.current.year).toBe(2024);
  });

  it("setMonth and setYear update the view", () => {
    const { result } = renderHook(() => useDatePicker());
    act(() => {
      result.current.setMonth(6);
      result.current.setYear(2030);
    });
    expect(result.current.month).toBe(6);
    expect(result.current.year).toBe(2030);
  });

  it("days grid always has 42 entries", () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultValue: new Date(2025, 1, 1) }),
    );
    expect(result.current.days).toHaveLength(42);
  });

  it("getDayProps marks a selected date correctly", () => {
    const date = new Date(2025, 3, 10);
    const { result } = renderHook(() =>
      useDatePicker({ mode: "single", defaultValue: date }),
    );
    const props = result.current.getDayProps(date);
    expect(props["data-selected"]).toBe(true);
    expect(props["aria-selected"]).toBe(true);
  });

  it("controlled mode: selected tracks value prop", () => {
    const date1 = new Date(2025, 0, 1);
    const date2 = new Date(2025, 0, 15);
    const { result, rerender } = renderHook(
      ({ value }) => useDatePicker({ mode: "single", value }),
      { initialProps: { value: date1 } },
    );
    expect(result.current.selected).toEqual(date1);
    rerender({ value: date2 });
    expect(result.current.selected).toEqual(date2);
  });
});

describe("useDatePicker — range mode", () => {
  it("starts with null selection", () => {
    const { result } = renderHook(() => useDatePicker({ mode: "range" }));
    expect(result.current.selected).toBeNull();
  });

  it("first click sets anchor but does not yet commit a range", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDatePicker({ mode: "range", onChange }),
    );
    const start = new Date(2025, 3, 1);
    act(() => result.current.getDayProps(start).onClick());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("second click commits a sorted range", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDatePicker({ mode: "range", onChange }),
    );
    const start = new Date(2025, 3, 10);
    const end = new Date(2025, 3, 20);
    act(() => result.current.getDayProps(start).onClick());
    act(() => result.current.getDayProps(end).onClick());
    expect(onChange).toHaveBeenLastCalledWith([
      expect.any(Date),
      expect.any(Date),
    ] as RangeValue);
    const range = onChange.mock.lastCall?.[0] as RangeValue;
    expect(range[0].getTime()).toBeLessThanOrEqual(range[1].getTime());
  });

  it("clicking end before start still produces a sorted range", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDatePicker({ mode: "range", onChange }),
    );
    const later = new Date(2025, 3, 20);
    const earlier = new Date(2025, 3, 5);
    act(() => result.current.getDayProps(later).onClick());
    act(() => result.current.getDayProps(earlier).onClick());
    const range = onChange.mock.lastCall?.[0] as RangeValue;
    expect(range[0].getTime()).toBeLessThanOrEqual(range[1].getTime());
  });

  it("isInRange returns true for a date between start and end", () => {
    const start = new Date(2025, 3, 1);
    const end = new Date(2025, 3, 30);
    const { result } = renderHook(() =>
      useDatePicker({ mode: "range", value: [start, end] }),
    );
    expect(result.current.isInRange(new Date(2025, 3, 15))).toBe(true);
    expect(result.current.isInRange(new Date(2025, 3, 1))).toBe(false);
    expect(result.current.isInRange(new Date(2025, 3, 30))).toBe(false);
  });

  it("isInRange returns false in single mode", () => {
    const { result } = renderHook(() =>
      useDatePicker({ mode: "single", value: new Date(2025, 3, 1) }),
    );
    expect(result.current.isInRange(new Date(2025, 3, 15))).toBe(false);
  });

  it("defaultMonth seeds the visible view", () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultMonth: { month: 6, year: 2030 } }),
    );
    expect(result.current.month).toBe(6);
    expect(result.current.year).toBe(2030);
  });

  it("controlled month ignores internal nextMonth state", () => {
    const onMonthChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ m }: { m: { month: number; year: number } }) =>
        useDatePicker({ month: m, onMonthChange }),
      { initialProps: { m: { month: 0, year: 2025 } } },
    );
    expect(result.current.month).toBe(0);
    act(() => result.current.nextMonth());
    // controlled — internal state cannot change; consumer must update prop
    expect(result.current.month).toBe(0);
    expect(onMonthChange).toHaveBeenCalledWith(1, 2025);

    rerender({ m: { month: 5, year: 2025 } });
    expect(result.current.month).toBe(5);
  });

  it("getDaysFor returns 42 cells for the offset month by default", () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultMonth: { month: 0, year: 2025 } }),
    );
    const next = result.current.getDaysFor(1);
    expect(next).toHaveLength(42);
    // First in-month day belongs to Feb 2025
    const inMonth = next.find((d) => d.getMonth() === 1 && d.getDate() === 1);
    expect(inMonth?.getFullYear()).toBe(2025);
  });

  it("getMonthYearAt returns the offset month/year", () => {
    const { result } = renderHook(() =>
      useDatePicker({ defaultMonth: { month: 11, year: 2025 } }),
    );
    expect(result.current.getMonthYearAt(1)).toEqual({ month: 0, year: 2026 });
    expect(result.current.getMonthYearAt(-1)).toEqual({ month: 10, year: 2025 });
  });

  it("modifiers tag matched dates via data-modifiers", () => {
    const monday = new Date(2025, 0, 6); // Mon
    const { result } = renderHook(() =>
      useDatePicker({
        defaultMonth: { month: 0, year: 2025 },
        modifiers: {
          weekend: (d) => d.getDay() === 0 || d.getDay() === 6,
          mondays: [monday],
        },
      }),
    );
    const props = result.current.getDayProps(monday);
    expect(props["data-modifiers"]).toContain("mondays");

    const sunday = new Date(2025, 0, 5);
    const sundayProps = result.current.getDayProps(sunday);
    expect(sundayProps["data-modifiers"]).toContain("weekend");

    const wednesday = new Date(2025, 0, 8);
    const wedProps = result.current.getDayProps(wednesday);
    expect(wedProps["data-modifiers"]).toBe("");
  });

  it("fixedWeeks=false trims trailing all-outside rows", () => {
    // February 2026 starts Sunday Feb 1, ends Saturday Feb 28 → exactly 4 rows.
    const { result } = renderHook(() =>
      useDatePicker({ defaultMonth: { month: 1, year: 2026 } }),
    );
    expect(result.current.days).toHaveLength(42);

    const { result: trimmed } = renderHook(() =>
      useDatePicker({ defaultMonth: { month: 1, year: 2026 }, fixedWeeks: false }),
    );
    expect(trimmed.current.days.length).toBeLessThan(42);
    // 28 days exactly: 4 rows × 7 = 28.
    expect(trimmed.current.days).toHaveLength(28);
  });

  it("getWeekNumber returns ISO 8601 week numbers", () => {
    const { result } = renderHook(() => useDatePicker());
    expect(result.current.getWeekNumber(new Date(2026, 0, 1))).toBe(1);
    // Dec 28 2025 (Sunday) is week 52 in ISO 8601.
    expect(result.current.getWeekNumber(new Date(2025, 11, 28))).toBe(52);
  });
});
