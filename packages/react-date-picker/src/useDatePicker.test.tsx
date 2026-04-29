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
});
