import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useStepper } from "./useStepper";
import type { StepperStep } from "./useStepper";

const steps: StepperStep[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];

describe("useStepper", () => {
  it("starts at index 0", () => {
    const { result } = renderHook(() => useStepper({ steps }));
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
  });

  it("goNext / goPrev advances and reverses", async () => {
    const { result } = renderHook(() => useStepper({ steps }));
    await act(async () => { await result.current.goNext(); });
    expect(result.current.activeStep).toBe(1);
    act(() => { result.current.goPrev(); });
    expect(result.current.activeStep).toBe(0);
  });

  it("marks step completed on goNext", async () => {
    const { result } = renderHook(() => useStepper({ steps }));
    await act(async () => { await result.current.goNext(); });
    expect(result.current.isCompleted("a")).toBe(true);
  });

  it("blocks goNext when validate returns false / a string", async () => {
    const stepsWithVal: StepperStep[] = [
      { id: "a", label: "A", validate: () => "Need terms" },
      { id: "b", label: "B" },
    ];
    const { result } = renderHook(() => useStepper({ steps: stepsWithVal }));
    let success: boolean | undefined;
    await act(async () => { success = await result.current.goNext(); });
    expect(success).toBe(false);
    expect(result.current.activeStep).toBe(0);
    expect(result.current.error).toBe("Need terms");
  });

  it("linear mode blocks forward jumps to unvisited steps", () => {
    const { result } = renderHook(() => useStepper({ steps, mode: "linear" }));
    let ok: boolean | undefined;
    act(() => { ok = result.current.goTo(2); });
    expect(ok).toBe(false);
    expect(result.current.activeStep).toBe(0);
  });

  it("non-linear mode allows arbitrary jumps", () => {
    const { result } = renderHook(() => useStepper({ steps, mode: "non-linear" }));
    let ok: boolean | undefined;
    act(() => { ok = result.current.goTo(2); });
    expect(ok).toBe(true);
    expect(result.current.activeStep).toBe(2);
  });

  it("finish fires onFinish on the final step", async () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useStepper({ steps, onFinish, defaultStep: 2 }));
    await act(async () => { await result.current.finish(); });
    expect(onFinish).toHaveBeenCalled();
    expect(result.current.isCompleted("c")).toBe(true);
  });

  it("reset returns to defaultStep + clears completed", async () => {
    const { result } = renderHook(() => useStepper({ steps }));
    await act(async () => { await result.current.goNext(); });
    act(() => { result.current.reset(); });
    expect(result.current.activeStep).toBe(0);
    expect(result.current.completedIds).toEqual([]);
  });
});
