import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useOTP } from "./useOTP";

describe("useOTP", () => {
  test("starts empty with default length 6", () => {
    const { result } = renderHook(() => useOTP());
    expect(result.current.value).toBe("");
    expect(result.current.slots).toHaveLength(6);
    expect(result.current.isComplete).toBe(false);
  });

  test("respects custom length", () => {
    const { result } = renderHook(() => useOTP({ length: 4 }));
    expect(result.current.slots).toHaveLength(4);
  });

  test("sanitizes defaultValue against numeric pattern", () => {
    const { result } = renderHook(() =>
      useOTP({ defaultValue: "12a3b4", pattern: "numeric" }),
    );
    expect(result.current.value).toBe("1234");
  });

  test("setValue is sanitized too", () => {
    const { result } = renderHook(() => useOTP({ length: 4 }));
    act(() => {
      result.current.setValue("12abc34");
    });
    expect(result.current.value).toBe("1234");
  });

  test("clear resets value to empty", () => {
    const { result } = renderHook(() =>
      useOTP({ defaultValue: "1234", length: 4 }),
    );
    expect(result.current.value).toBe("1234");
    act(() => {
      result.current.clear();
    });
    expect(result.current.value).toBe("");
  });

  test("calls onComplete when value reaches full length", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useOTP({ length: 4, onComplete }),
    );
    act(() => {
      result.current.setValue("12");
    });
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      result.current.setValue("1234");
    });
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  test("calls onChange whenever value changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOTP({ length: 4, onChange }),
    );
    act(() => {
      result.current.setValue("12");
    });
    expect(onChange).toHaveBeenCalledWith("12");
    act(() => {
      result.current.setValue("123");
    });
    expect(onChange).toHaveBeenCalledWith("123");
  });

  test("alphanumeric pattern accepts letters and digits", () => {
    const { result } = renderHook(() =>
      useOTP({ length: 4, pattern: "alphanumeric", uppercase: false }),
    );
    act(() => {
      result.current.setValue("ab12!@");
    });
    expect(result.current.value).toBe("ab12");
  });

  test("uppercase=true uppercases letters", () => {
    const { result } = renderHook(() =>
      useOTP({ length: 4, pattern: "alphanumeric" }),
    );
    act(() => {
      result.current.setValue("ab12");
    });
    expect(result.current.value).toBe("AB12");
  });

  test("custom regex pattern", () => {
    const { result } = renderHook(() =>
      useOTP({ length: 4, pattern: /^[xyz]$/, uppercase: false }),
    );
    act(() => {
      result.current.setValue("xyzabc");
    });
    expect(result.current.value).toBe("xyz");
  });

  test("isComplete is true when all slots filled", () => {
    const { result } = renderHook(() => useOTP({ length: 3 }));
    act(() => {
      result.current.setValue("123");
    });
    expect(result.current.isComplete).toBe(true);
  });

  test("isComplete is false when partially filled", () => {
    const { result } = renderHook(() => useOTP({ length: 4 }));
    act(() => {
      result.current.setValue("12");
    });
    expect(result.current.isComplete).toBe(false);
  });
});
