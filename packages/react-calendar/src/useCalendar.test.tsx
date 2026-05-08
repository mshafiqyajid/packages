import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCalendar } from "./useCalendar";
import type { CalendarRangeValue, CalendarMultipleValue } from "./useCalendar";

// ---------------------------------------------------------------------------
// Default month
// ---------------------------------------------------------------------------
describe("useCalendar — default month", () => {
  it("defaults viewMonth to current month when no defaultMonth is given", () => {
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    expect(result.current.viewMonth.getFullYear()).toBe(now.getFullYear());
    expect(result.current.viewMonth.getMonth()).toBe(now.getMonth());
  });

  it("respects defaultMonth", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2022, 5, 1) }),
    );
    expect(result.current.viewMonth.getFullYear()).toBe(2022);
    expect(result.current.viewMonth.getMonth()).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
describe("useCalendar — navigation", () => {
  it("goToNext advances viewMonth by one month", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2024, 0, 1) }),
    );
    act(() => result.current.goToNext());
    expect(result.current.viewMonth.getMonth()).toBe(1);
    expect(result.current.viewMonth.getFullYear()).toBe(2024);
  });

  it("goToPrev goes back one month", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2024, 3, 1) }),
    );
    act(() => result.current.goToPrev());
    expect(result.current.viewMonth.getMonth()).toBe(2);
    expect(result.current.viewMonth.getFullYear()).toBe(2024);
  });

  it("goToToday resets viewMonth to current month", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2022, 0, 1) }),
    );
    act(() => result.current.goToToday());
    const now = new Date();
    expect(result.current.viewMonth.getFullYear()).toBe(now.getFullYear());
    expect(result.current.viewMonth.getMonth()).toBe(now.getMonth());
  });

  it("goToNext wraps year from December to January", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2023, 11, 1) }),
    );
    act(() => result.current.goToNext());
    expect(result.current.viewMonth.getMonth()).toBe(0);
    expect(result.current.viewMonth.getFullYear()).toBe(2024);
  });
});

// ---------------------------------------------------------------------------
// Single mode
// ---------------------------------------------------------------------------
describe("useCalendar — single mode", () => {
  it("onChange called with Date on single-mode selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );
    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      );
    expect(cell).toBeDefined();
    act(() => {
      result.current.getDateProps(cell!).onClick();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    const called = onChange.mock.calls[0]?.[0] as Date;
    expect(called).toBeInstanceOf(Date);
    expect(called.getFullYear()).toBe(2024);
    expect(called.getMonth()).toBe(5);
    expect(called.getDate()).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// Range mode
// ---------------------------------------------------------------------------
describe("useCalendar — range mode", () => {
  it("first click sets range start, value[1] is null", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "range",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );
    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 10,
      )!;
    act(() => result.current.getDateProps(cell).onClick());
    const v = onChange.mock.calls[0]?.[0] as CalendarRangeValue;
    expect(v[0]).toBeInstanceOf(Date);
    expect(v[1]).toBeNull();
  });

  it("second click sets range end, value is [start, end]", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "range",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );

    const cell10 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 10,
      )!;
    act(() => result.current.getDateProps(cell10).onClick());

    // After first click, hook state updated — get fresh cell
    const cell20 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 20,
      )!;
    act(() => result.current.getDateProps(cell20).onClick());

    const v = onChange.mock.calls[1]?.[0] as CalendarRangeValue;
    expect(v[0]).toBeInstanceOf(Date);
    expect(v[1]).toBeInstanceOf(Date);
    expect((v[0] as Date).getDate()).toBe(10);
    expect((v[1] as Date).getDate()).toBe(20);
  });

  it("swaps start and end when end is selected before start", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "range",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );
    const cell20 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 20,
      )!;
    act(() => result.current.getDateProps(cell20).onClick());

    const cell5 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 5,
      )!;
    act(() => result.current.getDateProps(cell5).onClick());

    const v = onChange.mock.calls[1]?.[0] as CalendarRangeValue;
    expect((v[0] as Date).getDate()).toBe(5);
    expect((v[1] as Date).getDate()).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Multiple mode
// ---------------------------------------------------------------------------
describe("useCalendar — multiple mode", () => {
  it("clicking toggles dates in and out of selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "multiple",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );

    const cell15 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      )!;

    // First click: add
    act(() => result.current.getDateProps(cell15).onClick());
    const v1 = onChange.mock.calls[0]?.[0] as CalendarMultipleValue;
    expect(v1).toHaveLength(1);
    expect(v1[0]!.getDate()).toBe(15);

    // Second click: remove — need to use updated value with controlled approach
    const { result: result2 } = renderHook(() =>
      useCalendar({
        mode: "multiple",
        defaultMonth: new Date(2024, 5, 1),
        value: [new Date(2024, 5, 15)],
        onChange,
      }),
    );
    const cell15b = result2.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      )!;
    act(() => result2.current.getDateProps(cell15b).onClick());
    const v2 = onChange.mock.calls[1]?.[0] as CalendarMultipleValue;
    expect(v2).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Disabled dates
// ---------------------------------------------------------------------------
describe("useCalendar — disabled dates", () => {
  it("disabledDates as array prevents selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        disabledDates: [new Date(2024, 5, 15)],
        onChange,
      }),
    );

    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      )!;

    expect(cell.isDisabled).toBe(true);
    act(() => result.current.getDateProps(cell).onClick());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledDates as function prevents selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        disabledDates: (d) => d.getDay() === 0, // Sundays disabled
        onChange,
      }),
    );

    // Find a Sunday
    const sunday = result.current.weeks
      .flat()
      .find((c) => c.date.getDay() === 0 && c.isCurrentMonth)!;

    expect(sunday).toBeDefined();
    expect(sunday.isDisabled).toBe(true);
    act(() => result.current.getDateProps(sunday).onClick());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("minDate disables dates before it", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        minDate: new Date(2024, 5, 10),
        onChange,
      }),
    );

    const cell5 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 5,
      )!;

    expect(cell5.isDisabled).toBe(true);
    act(() => result.current.getDateProps(cell5).onClick());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("maxDate disables dates after it", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        maxDate: new Date(2024, 5, 10),
        onChange,
      }),
    );

    const cell20 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 20,
      )!;

    expect(cell20.isDisabled).toBe(true);
    act(() => result.current.getDateProps(cell20).onClick());
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------
describe("useCalendar — keyboard navigation", () => {
  it("ArrowRight moves focusedDate forward by one day", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2024, 5, 1) }),
    );

    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 10,
      )!;

    act(() => {
      result.current.getDateProps(cell).onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as unknown as import("react").KeyboardEvent<HTMLElement>);
    });

    expect(result.current.focusedDate).not.toBeNull();
    expect(result.current.focusedDate!.getDate()).toBe(11);
  });

  it("ArrowLeft moves focusedDate backward by one day", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2024, 5, 1) }),
    );

    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      )!;

    act(() => {
      result.current.getDateProps(cell).onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as unknown as import("react").KeyboardEvent<HTMLElement>);
    });

    expect(result.current.focusedDate).not.toBeNull();
    expect(result.current.focusedDate!.getDate()).toBe(14);
  });

  it("Enter on a date selects it", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );

    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 12,
      )!;

    act(() => {
      result.current.getDateProps(cell).onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as unknown as import("react").KeyboardEvent<HTMLElement>);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const called = onChange.mock.calls[0]?.[0] as Date;
    expect(called.getDate()).toBe(12);
  });

  it("Space on a date selects it", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        onChange,
      }),
    );

    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 8,
      )!;

    act(() => {
      result.current.getDateProps(cell).onKeyDown({
        key: " ",
        preventDefault: vi.fn(),
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as unknown as import("react").KeyboardEvent<HTMLElement>);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// ARIA attributes
// ---------------------------------------------------------------------------
describe("useCalendar — ARIA attributes", () => {
  it("aria-current='date' is set on today's cell", () => {
    const { result } = renderHook(() => useCalendar());
    const todayCell = result.current.weeks.flat().find((c) => c.isToday);
    if (todayCell) {
      const props = result.current.getDateProps(todayCell);
      expect(props["aria-current"]).toBe("date");
    }
  });

  it("aria-current is undefined on non-today cells", () => {
    const { result } = renderHook(() =>
      useCalendar({ defaultMonth: new Date(2024, 5, 1) }),
    );
    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15 &&
          !c.isToday,
      );
    if (cell) {
      const props = result.current.getDateProps(cell);
      expect(props["aria-current"]).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Data attributes
// ---------------------------------------------------------------------------
describe("useCalendar — data attributes", () => {
  it("data-selected is set when date is selected (single mode)", () => {
    const { result } = renderHook(() =>
      useCalendar({
        mode: "single",
        defaultMonth: new Date(2024, 5, 1),
        value: new Date(2024, 5, 15),
      }),
    );

    const cell = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      )!;

    const props = result.current.getDateProps(cell);
    expect(props["data-selected"]).toBe("");
  });

  it("data-today is set on today's date", () => {
    const { result } = renderHook(() => useCalendar());
    const todayCell = result.current.weeks.flat().find((c) => c.isToday);
    if (todayCell) {
      const props = result.current.getDateProps(todayCell);
      expect(props["data-today"]).toBe("");
    }
  });

  it("data-in-range is set for dates between range start and end", () => {
    const { result } = renderHook(() =>
      useCalendar({
        mode: "range",
        defaultMonth: new Date(2024, 5, 1),
        value: [new Date(2024, 5, 5), new Date(2024, 5, 15)] as [Date, Date],
      }),
    );

    // Date in the middle should have data-in-range
    const cell10 = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 10,
      )!;

    const props = result.current.getDateProps(cell10);
    expect(props["data-in-range"]).toBe("");
  });

  it("data-range-start and data-range-end are set on range endpoints", () => {
    const { result } = renderHook(() =>
      useCalendar({
        mode: "range",
        defaultMonth: new Date(2024, 5, 1),
        value: [new Date(2024, 5, 5), new Date(2024, 5, 15)] as [Date, Date],
      }),
    );

    const cellStart = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 5,
      )!;
    const cellEnd = result.current.weeks
      .flat()
      .find(
        (c) =>
          c.date.getFullYear() === 2024 &&
          c.date.getMonth() === 5 &&
          c.date.getDate() === 15,
      )!;

    expect(result.current.getDateProps(cellStart)["data-range-start"]).toBe("");
    expect(result.current.getDateProps(cellEnd)["data-range-end"]).toBe("");
  });
});
