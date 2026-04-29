import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePhoneInput } from "./usePhoneInput";

describe("usePhoneInput", () => {
  it("defaults to US country and empty value", () => {
    const { result } = renderHook(() => usePhoneInput());
    expect(result.current.country).toBe("US");
    expect(result.current.dialCode).toBe("1");
    expect(result.current.formattedValue).toBe("");
    expect(result.current.isValid).toBe(false);
  });

  it("formats digits according to country pattern", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: "5551234567", defaultCountry: "US" }),
    );
    expect(result.current.formattedValue).toBe("(555) 123-4567");
    expect(result.current.isValid).toBe(true);
  });

  it("marks isValid false when digit count is wrong", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: "555", defaultCountry: "US" }),
    );
    expect(result.current.isValid).toBe(false);
  });

  it("resets value and updates dialCode when country changes", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: "5551234567", defaultCountry: "US" }),
    );

    expect(result.current.dialCode).toBe("1");

    act(() => {
      result.current.setCountry("GB");
    });

    expect(result.current.country).toBe("GB");
    expect(result.current.dialCode).toBe("44");
    expect(result.current.formattedValue).toBe("");
    expect(result.current.isValid).toBe(false);
  });

  it("calls onChange with raw digits on input change", () => {
    const handleChange = vi.fn();
    const { result } = renderHook(() =>
      usePhoneInput({ onChange: handleChange, defaultCountry: "US" }),
    );

    act(() => {
      const syntheticEvent = {
        target: { value: "(555) 987-6543" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.inputProps.onChange(syntheticEvent);
    });

    expect(handleChange).toHaveBeenCalledWith("5559876543");
  });

  it("handles controlled value from outside", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ value: "2025550100", defaultCountry: "US" }),
    );

    expect(result.current.formattedValue).toBe("(202) 555-0100");
    expect(result.current.isValid).toBe(true);
  });

  it("respects defaultCountry prop for non-US country", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultCountry: "JP" }),
    );
    expect(result.current.country).toBe("JP");
    expect(result.current.dialCode).toBe("81");
  });

  it("strips non-digit characters from pasted input", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultCountry: "US" }),
    );

    act(() => {
      const syntheticEvent = {
        target: { value: "(555) abc 123-4567" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.inputProps.onChange(syntheticEvent);
    });

    expect(result.current.formattedValue).toBe("(555) 123-4567");
  });

  it("clamps input to max digit count for country", () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultCountry: "US" }),
    );

    act(() => {
      const syntheticEvent = {
        target: { value: "55512345678999" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.inputProps.onChange(syntheticEvent);
    });

    expect(result.current.formattedValue).toBe("(555) 123-4567");
  });
});
