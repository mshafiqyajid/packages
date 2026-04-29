import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useNumberInput } from "./useNumberInput";

describe("useNumberInput", () => {
  it("initialises with defaultValue and formats to precision", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 5, precision: 2 }),
    );
    expect(result.current.clampedValue).toBe(5);
    expect(result.current.formattedValue).toBe("5.00");
  });

  it("increment adds step and clamps to max", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 9, step: 1, max: 10 }),
    );
    act(() => result.current.increment());
    expect(result.current.clampedValue).toBe(10);
    act(() => result.current.increment());
    expect(result.current.clampedValue).toBe(10);
  });

  it("decrement subtracts step and clamps to min", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 1, step: 1, min: 0 }),
    );
    act(() => result.current.decrement());
    expect(result.current.clampedValue).toBe(0);
    act(() => result.current.decrement());
    expect(result.current.clampedValue).toBe(0);
  });

  it("calls onChange with clamped value on increment/decrement", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 5, step: 2, min: 0, max: 10, onChange }),
    );
    act(() => result.current.increment());
    expect(onChange).toHaveBeenCalledWith(7);
    act(() => result.current.decrement());
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("does not increment or decrement when disabled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 5, disabled: true, onChange }),
    );
    act(() => result.current.increment());
    act(() => result.current.decrement());
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.clampedValue).toBe(5);
  });

  it("does not increment or decrement when readOnly", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 3, readOnly: true, onChange }),
    );
    act(() => result.current.increment());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("incrementProps.disabled is true when at max", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 10, max: 10 }),
    );
    expect(result.current.incrementProps.disabled).toBe(true);
  });

  it("decrementProps.disabled is true when at min", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 0, min: 0 }),
    );
    expect(result.current.decrementProps.disabled).toBe(true);
  });

  it("inputProps has correct aria attributes", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 5, min: 0, max: 100 }),
    );
    expect(result.current.inputProps["aria-valuenow"]).toBe(5);
    expect(result.current.inputProps["aria-valuemin"]).toBe(0);
    expect(result.current.inputProps["aria-valuemax"]).toBe(100);
    expect(result.current.inputProps.role).toBe("spinbutton");
  });

  it("handles fractional step and precision correctly", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 0, step: 0.1, precision: 1 }),
    );
    act(() => result.current.increment());
    expect(result.current.clampedValue).toBeCloseTo(0.1);
    expect(result.current.formattedValue).toBe("0.1");
  });

  it("handles onBlur by committing parsed input text", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 0, min: 0, max: 100, onChange }),
    );
    act(() => {
      result.current.inputProps.onChange({
        target: { value: "42" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.inputProps.onBlur();
    });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("resets to fallback on blur when text is invalid", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 5 }),
    );
    act(() => {
      result.current.inputProps.onChange({
        target: { value: "abc" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.inputProps.onBlur();
    });
    expect(result.current.clampedValue).toBe(5);
  });

  it("ArrowUp key increments value", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 3, step: 1 }),
    );
    act(() => {
      result.current.inputProps.onKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.clampedValue).toBe(4);
  });

  it("ArrowDown key decrements value", () => {
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 3, step: 1 }),
    );
    act(() => {
      result.current.inputProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.clampedValue).toBe(2);
  });
});
