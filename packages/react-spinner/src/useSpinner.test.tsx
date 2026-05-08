import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSpinner } from "./useSpinner";

describe("useSpinner", () => {
  it('spinnerProps.role === "status"', () => {
    const { result } = renderHook(() => useSpinner());
    expect(result.current.spinnerProps.role).toBe("status");
  });

  it('spinnerProps["aria-live"] === "polite"', () => {
    const { result } = renderHook(() => useSpinner());
    expect(result.current.spinnerProps["aria-live"]).toBe("polite");
  });

  it('spinnerProps["aria-label"] === "Loading" by default', () => {
    const { result } = renderHook(() => useSpinner());
    expect(result.current.spinnerProps["aria-label"]).toBe("Loading");
  });

  it("custom label overrides default in aria-label", () => {
    const { result } = renderHook(() => useSpinner({ label: "Saving changes" }));
    expect(result.current.spinnerProps["aria-label"]).toBe("Saving changes");
  });

  it("empty label string uses the provided empty string", () => {
    const { result } = renderHook(() => useSpinner({ label: "" }));
    expect(result.current.spinnerProps["aria-label"]).toBe("");
  });
});
