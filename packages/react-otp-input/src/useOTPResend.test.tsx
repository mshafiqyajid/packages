import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useOTPResend } from "./useOTPResend";

describe("useOTPResend", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("starts in a resendable state with no cooldown", () => {
    const { result } = renderHook(() =>
      useOTPResend({ onResend: vi.fn(), cooldownMs: 3000 }),
    );
    expect(result.current.canResend).toBe(true);
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isPending).toBe(false);
  });

  test("calling resend invokes onResend", () => {
    const onResend = vi.fn();
    const { result } = renderHook(() =>
      useOTPResend({ onResend, cooldownMs: 3000 }),
    );
    act(() => {
      result.current.resend();
    });
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  test("starts cooldown after sync onResend", () => {
    const { result } = renderHook(() =>
      useOTPResend({ onResend: vi.fn(), cooldownMs: 3000 }),
    );
    act(() => {
      result.current.resend();
    });
    expect(result.current.canResend).toBe(false);
    expect(result.current.secondsLeft).toBe(3);
  });

  test("countdown decrements each second", () => {
    const { result } = renderHook(() =>
      useOTPResend({ onResend: vi.fn(), cooldownMs: 3000 }),
    );
    act(() => {
      result.current.resend();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(2);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(1);
  });

  test("canResend becomes true once cooldown expires", () => {
    const { result } = renderHook(() =>
      useOTPResend({ onResend: vi.fn(), cooldownMs: 3000 }),
    );
    act(() => {
      result.current.resend();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  test("does not call onResend during cooldown", () => {
    const onResend = vi.fn();
    const { result } = renderHook(() =>
      useOTPResend({ onResend, cooldownMs: 3000 }),
    );
    act(() => {
      result.current.resend();
    });
    act(() => {
      result.current.resend(); // ignored
    });
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  test("isPending is true while async onResend is in flight", async () => {
    let resolve!: () => void;
    const onResend = vi.fn(
      () => new Promise<void>((r) => { resolve = r; }),
    );
    const { result } = renderHook(() =>
      useOTPResend({ onResend, cooldownMs: 2000 }),
    );
    act(() => {
      result.current.resend();
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.canResend).toBe(false);

    await act(async () => {
      resolve();
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.secondsLeft).toBe(2);
  });

  test("default cooldown is 30 seconds", () => {
    const { result } = renderHook(() =>
      useOTPResend({ onResend: vi.fn() }),
    );
    act(() => {
      result.current.resend();
    });
    expect(result.current.secondsLeft).toBe(30);
  });
});
