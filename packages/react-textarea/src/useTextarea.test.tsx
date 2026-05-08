import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTextarea } from "./useTextarea";

describe("useTextarea", () => {
  it("default value sets initial charCount", () => {
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: "hello" }),
    );
    expect(result.current.charCount).toBe(5);
  });

  it("controlled value syncs charCount", () => {
    const { result } = renderHook(() =>
      useTextarea({ value: "hello world", onChange: vi.fn() }),
    );
    expect(result.current.charCount).toBe(11);
  });

  it("onChange event fires", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTextarea({ onChange }));

    const mockEvent = {
      target: { value: "test" },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.textareaProps.onChange(mockEvent);
    });

    expect(onChange).toHaveBeenCalledWith(mockEvent);
  });

  it("onValueChange fires with string value", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useTextarea({ onValueChange }));

    const mockEvent = {
      target: { value: "typed text" },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.textareaProps.onChange(mockEvent);
    });

    expect(onValueChange).toHaveBeenCalledWith("typed text");
  });

  it("charCount equals value.length", () => {
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: "abc" }),
    );
    expect(result.current.charCount).toBe(3);
  });

  it("isAtLimit true when charCount === maxLength", () => {
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: "hello", maxLength: 5 }),
    );
    expect(result.current.isAtLimit).toBe(true);
  });

  it("isOverLimit false when charCount === maxLength (at limit, not over)", () => {
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: "hello", maxLength: 5 }),
    );
    expect(result.current.isOverLimit).toBe(false);
  });

  it("isOverLimit true when charCount > maxLength", () => {
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: "hello!", maxLength: 5 }),
    );
    expect(result.current.isOverLimit).toBe(true);
  });

  it("textareaProps['aria-invalid'] is true when invalid prop", () => {
    const { result } = renderHook(() => useTextarea({ invalid: true }));
    expect(result.current.textareaProps["aria-invalid"]).toBe(true);
  });

  it("textareaProps disabled is true when disabled prop", () => {
    const { result } = renderHook(() => useTextarea({ disabled: true }));
    expect(result.current.textareaProps.disabled).toBe(true);
  });

  it("textareaProps readOnly is true when readOnly prop", () => {
    const { result } = renderHook(() => useTextarea({ readOnly: true }));
    expect(result.current.textareaProps.readOnly).toBe(true);
  });

  it("uncontrolled: updates charCount on change", () => {
    const { result } = renderHook(() => useTextarea());

    const mockEvent = {
      target: { value: "new value" },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.textareaProps.onChange(mockEvent);
    });

    expect(result.current.charCount).toBe(9);
  });

  it("isAtLimit false when under maxLength", () => {
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: "hi", maxLength: 10 }),
    );
    expect(result.current.isAtLimit).toBe(false);
  });
});
